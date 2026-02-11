import { User } from 'src/modules/user/entities/user.entity';
import { BaseEntity } from 'src/common/entities';
import { Entity, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart extends BaseEntity {
  @OneToOne(() => User, (user) => user.cart)
  @JoinColumn()
  user: User;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];
}
