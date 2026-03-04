import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Payment } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { StripeProvider } from './providers/stripe.provider';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { OrderStatus, PaymentProvider, PaymentStatus } from 'src/common/enums';
import Stripe from 'stripe';
import { Product } from '../product/entities/product.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  PaymentFailedEvent,
  PaymentSuccessEvent,
  RefundedEvent,
} from '../mail/events/mail.events';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly stripeProvider: StripeProvider,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getAllPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({ relations: ['order'] });
  }

  async createPaymentIntent(
    userId: number,
    dto: CreatePaymentIntentDto,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const order = await this.orderRepository.findOne({
      where: { id: dto.orderId, user: { id: userId } },
      relations: ['payments'],
    });

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${dto.orderId} not found for this user`,
      );
    }

    if (order.status !== OrderStatus.AWAITING_PAYMENT) {
      throw new BadRequestException(
        `Order with ID ${dto.orderId} is not awaiting payment. Current status: ${order.status}`,
      );
    }

    // Check for existing payments
    const existingPayments: Payment[] = (order.payments as Payment[]) || [];

    // If any payment is already completed, don't allow creating a new intent
    const completedPayment = existingPayments.find(
      (p) => p.status === PaymentStatus.COMPLETED,
    );
    if (completedPayment) {
      throw new BadRequestException(
        `Order with ID ${dto.orderId} has already been paid`,
      );
    }

    // If there's a pending payment intent, try to reuse it
    const pendingPayment = existingPayments.find(
      (p) => p.paymentIntentId && p.status === PaymentStatus.PENDING,
    );

    if (pendingPayment?.paymentIntentId) {
      try {
        const existingIntent = await this.stripeProvider.retrievePaymentIntent(
          pendingPayment.paymentIntentId,
        );

        // Reuse existing intent if it's still valid
        if (
          existingIntent.status !== 'canceled' &&
          existingIntent.status !== 'succeeded'
        ) {
          this.logger.log(
            `Reusing existing PaymentIntent ${existingIntent.id} for Order ${order.id}`,
          );
          return {
            clientSecret: existingIntent.client_secret as string,
            paymentIntentId: existingIntent.id,
          };
        }
      } catch (error) {
        this.logger.warn(
          `Failed to retrieve existing PaymentIntent: ${error instanceof Error ? error.message : 'Unknown error'}. Creating new intent.`,
        );
      }
    }

    const currency = this.configService.get<string>('stripe.currency', 'usd');

    const { clientSecret, paymentIntentId } =
      await this.stripeProvider.createPaymentIntent(
        order.totalAmount,
        currency,
        {
          orderId: order.id.toString(),
          userId: userId.toString(),
        },
      );

    // Update pending payment or create new payment record
    if (pendingPayment) {
      pendingPayment.paymentIntentId = paymentIntentId;
      pendingPayment.status = PaymentStatus.PENDING;
      pendingPayment.method = dto.paymentMethod;
      await this.paymentRepository.save(pendingPayment);
      this.logger.log(
        `Updated existing Payment ${pendingPayment.id} with new PaymentIntent ${paymentIntentId}`,
      );
    } else {
      const payment = this.paymentRepository.create({
        order,
        amount: order.totalAmount,
        currency,
        status: PaymentStatus.PENDING,
        method: dto.paymentMethod,
        provider: PaymentProvider.STRIPE,
        paymentIntentId,
      });
      await this.paymentRepository.save(payment);
      this.logger.log(
        `Created new Payment record with PaymentIntent ${paymentIntentId} for Order ${order.id}`,
      );
    }

    return { clientSecret, paymentIntentId };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const event = this.stripeProvider.constructWebhookEvent(payload, signature);
    this.logger.debug(`Received Stripe webhook event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;

      case 'payment_intent.created':
        this.logger.debug(
          `PaymentIntent created with ID: ${event.data.object.id} and amount: ${event.data.object.amount}`,
        );
        break;

      default:
        this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.paymentRepository.findOne({
      where: { paymentIntentId: paymentIntent.id },
      relations: ['order', 'order.user'],
    });

    if (!payment) {
      this.logger.error(
        `Payment record not found for PaymentIntent ID: ${paymentIntent.id}`,
      );
      return;
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      this.logger.warn(
        `Payment for PaymentIntent ID: ${paymentIntent.id} is already marked as completed`,
      );
      return;
    }

    this.eventEmitter.emit(
      'payment.success',
      new PaymentSuccessEvent(
        payment.order.user.email,
        payment.order.id,
        payment.amount,
      ),
    );

    const order = payment.order;

    // Check if order was expired or cancelled while payment was in progress
    if (
      order.status === OrderStatus.EXPIRED ||
      order.status === OrderStatus.CANCELLED
    ) {
      this.logger.warn(
        `Order ${order.id} was ${order.status} while payment was in progress. Auto-refunding payment ${payment.id}.`,
      );

      await this.stripeProvider.createRefund(paymentIntent.id);
      this.eventEmitter.emit(
        'payment.refunded',
        new RefundedEvent(order.user.email, order.id, payment.amount),
      );

      payment.status = PaymentStatus.REFUNDED;
      payment.refundedAmount = payment.amount;
      payment.refundedAt = new Date();
      payment.processedAt = new Date();

      await this.paymentRepository.save(payment);
      return;
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.providerTransactionId = paymentIntent.id;
    payment.processedAt = new Date();
    await this.paymentRepository.save(payment);
    payment.metadata = {
      ...payment.metadata,
      stripePaymentMethodId:
        typeof paymentIntent.payment_method === 'string'
          ? paymentIntent.payment_method
          : paymentIntent.payment_method?.id,
    };

    order.status = OrderStatus.PAID;
    await this.orderRepository.save(order);

    this.logger.log(
      `Payment ${payment.id} completed. Order ${order.id} marked as PAID`,
    );
  }

  async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.paymentRepository.findOne({
      where: { paymentIntentId: paymentIntent.id },
      relations: ['order', 'order.items', 'order.items.product', 'order.user'],
    });

    if (!payment) {
      this.logger.error(
        `Payment record not found for failed PaymentIntent ID: ${paymentIntent.id}`,
      );
      return;
    }

    if (payment.status === PaymentStatus.FAILED) {
      this.logger.warn(
        `Payment for PaymentIntent ID: ${paymentIntent.id} is already marked as failed`,
      );
      return;
    }

    this.eventEmitter.emit(
      'payment.failed',
      new PaymentFailedEvent(
        payment.order.user.email,
        payment.order.id,
        paymentIntent.last_payment_error?.message || 'Payment failed',
      ),
    );
    payment.status = PaymentStatus.FAILED;
    payment.failureReason =
      paymentIntent.last_payment_error?.message || 'Unknown error';
    payment.processedAt = new Date();

    await this.paymentRepository.save(payment);

    await this.dataSource.manager.transaction(async (manager) => {
      const order = payment.order;

      for (const item of order.items) {
        await manager.increment(
          Product,
          { id: item.product.id },
          'stock',
          item.quantity,
        );
      }

      order.status = OrderStatus.FAILED;
      await manager.save(order);
    });

    this.logger.log(
      `Payment ${payment.id} failed. Order ${payment.order.id} marked as FAILED and stock restored.`,
    );
  }

  async getPaymentById(paymentId: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    return payment;
  }

  async getPaymentsForUser(userId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { order: { user: { id: userId } } },
      relations: ['order'],
      order: { created_at: 'DESC' },
    });
  }

  async getPaymentByOrderId(orderId: number, userId: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { order: { id: orderId } },
      relations: ['order', 'order.user'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment for Order ID ${orderId} not found`);
    }

    if (payment?.order.user.id !== userId) {
      throw new NotFoundException(
        `Payment for Order ID ${orderId} not found for this user`,
      );
    }

    return payment;
  }

  async refundPayment(paymentId: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order', 'order.user'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(`Only completed payments can be refunded`);
    }

    await this.stripeProvider.createRefund(payment.paymentIntentId!);
    this.eventEmitter.emit(
      'payment.refunded',
      new RefundedEvent(
        payment.order.user.email,
        payment.order.id,
        payment.amount,
      ),
    );

    payment.status = PaymentStatus.REFUNDED;
    payment.refundedAmount = payment.amount;
    payment.refundedAt = new Date();

    await this.paymentRepository.save(payment);

    return payment;
  }
}
