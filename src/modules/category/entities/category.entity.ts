import { BaseEntity } from 'src/common/entities';
import {
  Entity,
  Column,
  Index,
  OneToMany,
  ManyToOne,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity('categories')
@Tree('materialized-path')
export class Category extends BaseEntity {
  @Column()
  @Index({ fulltext: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('int', { default: 0 })
  sortOrder: number;

  @TreeChildren()
  children: Category[];

  @TreeParent()
  parent: Category;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
