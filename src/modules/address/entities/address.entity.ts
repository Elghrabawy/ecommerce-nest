import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../user/entities/user.entity';

@Entity('addresses')
export class Address extends BaseEntity {
  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  Title: string;

  @Column()
  company: string;

  @Column()
  streetAddress: string;

  @Column({ nullable: true })
  addressLine2?: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  @Index()
  postalCode: string;

  @Column({ length: 2 })
  @Index()
  country: string; // country code

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: false })
  isDefault: boolean;

  // Computed property for formatted address
  get formattedAddress(): string {
    const lines = [
      this.streetAddress,
      this.addressLine2,
      `${this.city}, ${this.state} ${this.postalCode}`,
      this.country,
    ].filter(Boolean);

    return lines.join(', ');
  }
}
