import { OrderItem } from 'src/order/entities/order-item.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Entity, Column, Index, VersionColumn, OneToMany } from 'typeorm';
@Entity('products')
export class Product extends BaseEntity {
  @Column()
  @Index({ fulltext: true }) 
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stock: number;

  @Column('jsonb', { nullable: true })
  images: string[];

  // Optimistic Locking: Increment automatically on save
  @VersionColumn()
  version: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany((type) => Review, (review) => review.product)
  reviews: Review[];
}
