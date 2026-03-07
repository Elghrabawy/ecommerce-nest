import { Faker } from '@faker-js/faker';
import { CartItem } from '../../../modules/cart/entities/cart-item.entity';
import { setSeederFactory } from 'typeorm-extension';

export const CartItemFactory = setSeederFactory(CartItem, (faker: Faker) => {
  const cartItem = new CartItem();

  cartItem.quantity = faker.number.int({ min: 1, max: 5 });
  // Cart and Product will be assigned in the seeder

  return cartItem;
});