import { BaseEntity } from '../../../common/entities';
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
import { Product } from '../../product/entities/product.entity';
import { Exclude } from 'class-transformer';

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

  @Exclude()
  @Column({ default: true })
  isActive: boolean;

  @Exclude()
  @Column('int', { default: 0 })
  sortOrder: number;

  @TreeChildren()
  children: Category[];

  @Exclude()
  @TreeParent()
  parent: Category;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
