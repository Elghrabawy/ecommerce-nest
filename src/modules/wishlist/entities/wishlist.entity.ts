import { Product } from 'src/modules/product/entities/product.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { BaseEntity } from 'src/common/entities';
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
