import { Exclude, Expose } from 'class-transformer';
import { Review } from '../../reviews/entities/review.entity';
import { Order } from '../../order/entities/order.entity';
import { UserRole } from '../../../common/utils/enums';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entities';
import { Wishlist } from 'src/modules/wishlist/entities/wishlist.entity';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { Address } from 'src/modules/address/entities/address.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password_hash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Expose()
  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  @Column({ type: 'text', nullable: true })
  avatar_url: string | null;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToOne(() => Cart, (cart) => cart.user, { cascade: true })
  cart: Cart;

  @OneToOne(() => Wishlist, (wishlist) => wishlist.user, { cascade: true })
  wishlist: Wishlist;

  @OneToMany(() => Address, (address) => address.user, { cascade: true })
  addresses: Address[];
}
