import { User } from 'src/user/entities/user.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { OrderStatus } from 'src/utils/enums';
import { Entity, Column, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Address } from 'src/address/entities/address.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ nullable: true })
  paymentIntentId: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToOne(() => Payment, (payment) => payment.order, { cascade: true })
  payment: Payment;

  @ManyToOne(() => Address, { nullable: true })
  shippingAddress: Address;

  @ManyToOne(() => Address, { nullable: true })
  billingAddress: Address;
}
