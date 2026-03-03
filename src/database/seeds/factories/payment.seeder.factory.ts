import { Faker } from '@faker-js/faker';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { setSeederFactory } from 'typeorm-extension';
import {
  PaymentStatus,
  PaymentMethod,
  PaymentProvider,
} from 'src/common/enums';

export const PaymentFactory = setSeederFactory(Payment, (faker: Faker) => {
  const payment = new Payment();

  payment.amount = parseFloat(faker.commerce.price({ min: 50, max: 2000 }));
  payment.currency = faker.helpers.arrayElement(['USD', 'EUR', 'GBP']);
  payment.status = faker.helpers.enumValue(PaymentStatus);
  payment.method = faker.helpers.enumValue(PaymentMethod);
  payment.provider = faker.helpers.enumValue(PaymentProvider);

  if (faker.datatype.boolean(0.8)) {
    payment.transactionId = faker.string.alphanumeric(16);
  }

  if (faker.datatype.boolean(0.7)) {
    payment.paymentIntentId = `pi_${faker.string.alphanumeric(24)}`;
  }

  if (faker.datatype.boolean(0.8)) {
    payment.providerTransactionId = faker.string.alphanumeric(20);
  }

  if (faker.datatype.boolean(0.1)) {
    payment.refundedAmount = parseFloat(
      faker.commerce.price({ min: 10, max: 100 }),
    );
  }

  if (payment.status === PaymentStatus.FAILED) {
    payment.failureReason = faker.helpers.arrayElement([
      'Insufficient funds',
      'Invalid card number',
      'Expired card',
      'Processing error',
    ]);
  }

  if (faker.datatype.boolean(0.3)) {
    payment.metadata = { reference: faker.string.alphanumeric(10) };
  }

  if (
    [PaymentStatus.COMPLETED, PaymentStatus.FAILED].includes(payment.status)
  ) {
    payment.processedAt = faker.date.past();
  }

  // Order will be assigned in the seeder
  return payment;
});
