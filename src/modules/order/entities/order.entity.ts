import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../../common/entities';
import { OrderStatus } from '../../../common/enums';
import { Entity, Column, ManyToOne, OneToMany, OneToOne, Index } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { Address } from '../../address/entities/address.entity';

@Entity('orders')
// index to optimize queries filtering by status and created_at (for expiration checks)
@Index('IDX_orders_status_created_at', ['status', 'created_at'])
export class Order extends BaseEntity {
  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ nullable: true })
  paymentIntentId?: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order, { cascade: true })
  payments?: Payment[];

  @ManyToOne(() => Address, { nullable: true })
  shippingAddress: Address;

  @ManyToOne(() => Address, { nullable: true })
  billingAddress: Address;
}
