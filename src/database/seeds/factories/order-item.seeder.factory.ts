import { Faker } from '@faker-js/faker';
import { OrderItem } from 'src/modules/order/entities/order-item.entity';
import { setSeederFactory } from 'typeorm-extension';

export const OrderItemFactory = setSeederFactory(OrderItem, (faker: Faker) => {
  const orderItem = new OrderItem();

  orderItem.quantity = faker.number.int({ min: 1, max: 3 });
  orderItem.priceAtPurchase = parseFloat(faker.commerce.price({ min: 10, max: 500 }));
  // Order and Product will be assigned in the seeder

  return orderItem;
});