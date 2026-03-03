import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Repository, DataSource, In, LessThan } from 'typeorm';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddressService } from '../address/address.service';
import { User } from '../user/entities/user.entity';
import { Product } from '../product/entities/product.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatus } from 'src/common/enums';
import { Address } from '../address/entities/address.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly orderExpirationTimeInMinutes: number;

  private static readonly CANCELLABLE_STATUSES: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.AWAITING_PAYMENT,
    OrderStatus.FAILED,
  ];

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly userService: UserService,
    private readonly addressService: AddressService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.orderExpirationTimeInMinutes = this.configService.get<number>(
      'ORDER_EXPIRATION_TIME_MINUTES',
      30,
    );
  }

  async getAllOrders(): Promise<Order[]> {
    const order = await this.orderRepository.find({
      relations: ['user', 'items', 'items.product'],
    });
    return order;
  }

  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['user', 'items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async getAddressIdForUser(
    userId: number,
    addressId?: number,
  ): Promise<number> {
    if (!addressId) {
      const defaultAddress =
        await this.addressService.findDefaultAddress(userId);
      if (!defaultAddress) {
        throw new NotFoundException(
          `No default address found for user with ID ${userId}`,
        );
      }

      return defaultAddress.id;
    }

    const isAuthorized = await this.addressService.isAuthorizedAddress(
      userId,
      addressId,
    );

    if (!isAuthorized) {
      throw new NotFoundException( // should unauthorized exception?
        `Address with ID ${addressId} not found for user with ID ${userId}`,
      );
    }

    return addressId;
  }

  async createOrder(userId: number, orderData: CreateOrderDto): Promise<Order> {
    orderData.shippingAddressId = await this.getAddressIdForUser(
      userId,
      orderData.shippingAddressId,
    );

    orderData.billingAddressId = await this.getAddressIdForUser(
      userId,
      orderData.billingAddressId,
    );

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      let totalAmount: number = 0;
      const orderItems: OrderItem[] = [];

      const products = await queryRunner.manager.find(Product, {
        where: { id: In(orderData.items.map((item) => item.productId)) },
        lock: { mode: 'pessimistic_write' },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const item of orderData.items) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product with ID ${item.productId}`,
          );
        }

        orderItems.push({
          product,
          quantity: item.quantity,
          priceAtPurchase: product.price,
        } as OrderItem);

        product.stock -= item.quantity;

        totalAmount += product.price * item.quantity;
      }
      await queryRunner.manager.save(Product, products);

      const order = queryRunner.manager.create(Order, {
        user,
        totalAmount,
        status: OrderStatus.AWAITING_PAYMENT,
        items: orderItems,
        shippingAddress: { id: orderData.shippingAddressId } as Address,
        billingAddress: { id: orderData.billingAddressId } as Address,
      });

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.status = status;
    await this.orderRepository.save(order);
  }

  async cancelOrder(orderId: number) {
    await this.dataSource.manager.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: ['items', 'items.product'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      if (!OrderService.CANCELLABLE_STATUSES.includes(order.status)) {
        throw new BadRequestException(
          `Order with ID ${orderId} cannot be cancelled. Current status: ${order.status}. Only orders with status ${OrderService.CANCELLABLE_STATUSES.join(', ')} can be cancelled.`,
        );
      }

      order.status = OrderStatus.CANCELLED;

      for (const item of order.items) {
        const result = await manager.increment(
          Product,
          { id: item.product.id },
          'stock',
          item.quantity,
        );

        if (result.affected === 0) {
          throw new BadRequestException(
            `Product With ID ${item.product.id} not found`,
          );
        }
      }

      await manager.save(order);
    });
  }

  async getOrdersByUserId(userId: number) {
    const user = await this.userService.findById(userId);

    const orders = await this.orderRepository.find({
      where: { user: { id: user.id } },
      relations: ['items', 'items.product'],
    });

    return orders;
  }

  async calculateOrderTotal(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    let total = 0;
    for (const item of order.items) {
      total += item.priceAtPurchase * item.quantity;
    }

    return total;
  }

  async getOrderItems(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const products = order.items.map((item) => {
      return {
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
      };
    });

    return products;
  }

  @Cron('0 */1 * * * *')
  async expireUnpaidOrders() {
    const expirationTime = new Date();
    expirationTime.setMinutes(
      expirationTime.getMinutes() - this.orderExpirationTimeInMinutes,
    );

    this.logger.debug(
      `Running expireUnpaidOrders job. Expiring orders created before ${expirationTime}`,
    );

    const expiredOrders = await this.orderRepository.find({
      where: {
        status: OrderStatus.AWAITING_PAYMENT,
        created_at: LessThan(expirationTime),
      },
      relations: ['items', 'items.product', 'payments'],
    });

    if (expiredOrders.length === 0) return;

    this.logger.log(
      `Found ${expiredOrders.length} expired unpaid orders. Cleaning up...`,
    );

    for (const order of expiredOrders) {
      try {
        await this.dataSource.manager.transaction(async (manager) => {
          for (const item of order.items) {
            await manager.increment(
              Product,
              { id: item.product.id },
              'stock',
              item.quantity,
            );
          }

          order.status = OrderStatus.EXPIRED;
          await manager.save(order);
          this.logger.log(`Order ${order.id} expired and stock restored.`);
        });
      } catch (error) {
        this.logger.error(
          `Failed to expire order ${order.id}: ${error.message}`,
        );
      }
    }
  }
}
