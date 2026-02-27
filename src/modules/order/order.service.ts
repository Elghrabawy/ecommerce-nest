import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository, DataSource, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddressService } from '../address/address.service';
import { User } from '../user/entities/user.entity';
import { Product } from '../product/entities/product.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatus } from 'src/common/utils/enums';
import { Address } from '../address/entities/address.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly userService: UserService,
    private readonly addressService: AddressService,
    private readonly dataSource: DataSource,
  ) {}

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

        product.stock -= item.quantity
        
        totalAmount += product.price * item.quantity;
      }
      await queryRunner.manager.save(Product, products)

      const order = queryRunner.manager.create(Order, {
        user,
        totalAmount,
        status: OrderStatus.PENDING,
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

      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException(
          `Order with ID ${orderId} is already canceled`,
        );
      }

      // TODO: check if the order not shipped

      order.status = OrderStatus.CANCELLED;

      for (const item of order.items) {
        const result = await manager.increment(
          Product, 
          { id: item.product.id }, 
          'stock', 
          item.quantity
        );
        
        
        if(result.affected === 0) {
          throw new BadRequestException(`Product With ID ${item.product.id} not found`)
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
}
