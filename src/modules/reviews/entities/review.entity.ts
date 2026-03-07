import { Product } from '../../product/entities/product.entity';
import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../../common/entities';
import { Check, Column, Entity, ManyToOne } from 'typeorm';

@Entity('reviews')
@Check('"rating" >= 1 AND "rating" <= 5')
export class Review extends BaseEntity {
  @Column({
    type: 'int',
  })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column()
  productId: number;

  @Column()
  userId: number;

  @ManyToOne(() => Product, (product) => product.reviews)
  product: Product;

  @ManyToOne(() => User, (user) => user.reviews)
  user: User;
}
