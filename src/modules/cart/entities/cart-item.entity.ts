import { BaseEntity } from '../../../common/entities';
import { Entity, Column, ManyToOne, Unique } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../../product/entities/product.entity';
import { Index } from 'typeorm';
import { Exclude } from 'class-transformer';

@Index(['product', 'cart'])
@Unique(['product', 'cart'])
@Entity('cart_items')
export class CartItem extends BaseEntity {
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @Exclude()
  cart: Cart;

  @Column()
  @Exclude()
  cartId: number;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  @Exclude()
  productId: number;

  @Column('int')
  quantity: number;
}
