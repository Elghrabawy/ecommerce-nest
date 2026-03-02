import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  PaymentFailedEvent,
  PaymentSuccessEvent,
  UserCreatedEvent,
} from '../events/mail.events';
import { MailService } from '../mail.service';
import { Injectable, Logger } from '@nestjs/common';
import { RefundedEvent } from './../events/mail.events';

@Injectable()
export class MailSubscriber {
  private readonly logger = new Logger(MailSubscriber.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly mailService: MailService,
  ) {}

  @OnEvent('user.created', { async: true })
  async handleUserCreatedEvent(user: UserCreatedEvent) {
    this.logger.log(
      `[USER CREATED] User created event received: ${user.email}`,
    );

    try {
      console.log('Sending welcome email to:', user.email);
      await this.mailService.sendWelcomeEmail(user.email, user.name);
      this.logger.log(`Welcome email sent successfully to: ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${user.email}:`,
        error,
      );
    }
  }

  @OnEvent('payment.success', { async: true })
  async handlePaymentSuccessEvent(paymentInfo: PaymentSuccessEvent) {
    this.logger.log(
      `[PAYMENT SUCCESS] Payment success event received for order: ${paymentInfo.orderId}`,
    );

    try {
      console.log(
        'Sending payment success email for order:',
        paymentInfo.orderId,
      );
      await this.mailService.sendPaymentSuccessEmail(
        paymentInfo.email,
        paymentInfo.orderId,
        paymentInfo.amount,
      );
      this.logger.log(
        `Payment success email sent successfully for order: ${paymentInfo.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send payment success email for order ${paymentInfo.orderId}:`,
        error,
      );
    }
  }

  @OnEvent('payment.refunded', { async: true })
  async handlePaymentRefundedEvent(refundInfo: RefundedEvent) {
    this.logger.log(
      `[PAYMENT REFUNDED] Payment refunded event received for order: ${refundInfo.orderId}`,
    );

    try {
      await this.mailService.sendRefundEmail(
        refundInfo.email,
        refundInfo.orderId,
        refundInfo.amount,
      );
      this.logger.log(
        `Refund email sent successfully for order: ${refundInfo.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send refund email for order ${refundInfo.orderId}:`,
        error,
      );
    }
  }

  @OnEvent('payment.failed', { async: true })
  async handlePaymentFailedEvent(paymentInfo: PaymentFailedEvent) {
    this.logger.log(
      `[PAYMENT FAILED] Payment failed event received for order: ${paymentInfo.orderId}`,
    );

    try {
      await this.mailService.sendPaymentFailedEmail(
        paymentInfo.email,
        paymentInfo.orderId,
        paymentInfo.reason,
      );
      this.logger.log(
        `Payment failed email sent successfully for order: ${paymentInfo.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send payment failed email for order ${paymentInfo.orderId}:`,
        error,
      );
    }
  }
}
