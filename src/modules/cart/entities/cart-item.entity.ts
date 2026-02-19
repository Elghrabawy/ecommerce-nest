import { BaseEntity } from 'src/common/entities';
import { Entity, Column, ManyToOne, Unique } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Index } from 'typeorm';

@Index(['product', 'cart'])
@Unique(['product', 'cart'])
@Entity('cart_items')
export class CartItem extends BaseEntity {
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @ManyToOne(() => Product, { eager: true })
  product: Product;

  @Column('int')
  quantity: number;
}
