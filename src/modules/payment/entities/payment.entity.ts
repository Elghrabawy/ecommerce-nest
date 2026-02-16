import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { Order } from '../../order/entities/order.entity';
import {
  PaymentStatus,
  PaymentMethod,
  PaymentProvider,
} from '../../../common/utils/enums';

@Entity('payments')
export class Payment extends BaseEntity {
  @OneToOne(() => Order, { nullable: false })
  @JoinColumn()
  order: Order;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentProvider })
  provider: PaymentProvider;

  @Column({ nullable: true })
  transactionId?: string;

  @Column({ nullable: true })
  paymentIntentId?: string;

  @Column({ nullable: true })
  providerTransactionId?: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  refundedAmount?: number;

  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt?: Date;
}
