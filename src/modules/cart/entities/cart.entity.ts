import { User } from '../../user/entities/user.entity';
import { BaseEntity } from '../../../common/entities';
import { Entity, OneToOne, OneToMany, JoinColumn, Column } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { Exclude } from 'class-transformer';

@Entity('carts')
export class Cart extends BaseEntity {
  @OneToOne(() => User, (user) => user.cart)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  @Exclude()
  userId: number;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];
}
