import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import { BaseEntity } from 'src/utils/base.entity';
import { Entity, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';

@Entity('wishlists')
export class Wishlist extends BaseEntity {
  @OneToOne(() => User, (user) => user.wishlist)
  @JoinColumn()
  user: User;

  @ManyToMany(() => Product)
  @JoinTable({ name: 'wishlist_products' }) // Creates a pivot table
  products: Product[];
}
