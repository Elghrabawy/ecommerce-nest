import { Faker } from '@faker-js/faker';
import { Order } from '../../../modules/order/entities/order.entity';
import { setSeederFactory } from 'typeorm-extension';
import { OrderStatus } from '../../../common/enums';

export const OrderFactory = setSeederFactory(Order, (faker: Faker) => {
  const order = new Order();

  order.totalAmount = parseFloat(faker.commerce.price({ min: 50, max: 2000 }));
  order.status = faker.helpers.enumValue(OrderStatus);
  if (faker.datatype.boolean(0.7)) {
    order.paymentIntentId = `pi_${faker.string.alphanumeric(24)}`;
  }

  // User, items, payment, and addresses will be assigned in the seeder
  return order;
});
