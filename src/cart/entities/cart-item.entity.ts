import { BaseEntity } from 'src/utils/base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from 'src/product/entities/product.entity';

@Entity('cart_items')
export class CartItem extends BaseEntity {
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @ManyToOne(() => Product, { eager: true })
  product: Product;

  @Column('int')
  quantity: number;
}
