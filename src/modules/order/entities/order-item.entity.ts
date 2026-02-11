import { BaseEntity } from 'src/common/utils/base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { eager: true }) // Load product details automatically
  product: Product;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  priceAtPurchase: number;
}
