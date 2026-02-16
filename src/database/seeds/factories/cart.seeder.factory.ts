import { Faker } from '@faker-js/faker';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { setSeederFactory } from 'typeorm-extension';

export const CartFactory = setSeederFactory(Cart, (faker: Faker) => {
  const cart = new Cart();
  // User will be assigned in the seeder
  // Items will be created separately
  return cart;
});