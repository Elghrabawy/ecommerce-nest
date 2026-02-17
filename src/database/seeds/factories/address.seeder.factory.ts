import { Faker } from '@faker-js/faker';
import { Address } from 'src/modules/address/entities/address.entity';
import { setSeederFactory } from 'typeorm-extension';

export const AddressFactory = setSeederFactory(Address, (faker: Faker) => {
  const address = new Address();

  address.Title = faker.helpers.arrayElement([
    'Home',
    'Office',
    'Apartment',
    'House',
  ]);
  address.company = faker.datatype.boolean(0.3) ? faker.company.name() : '';
  address.streetAddress = faker.location.streetAddress();
  if (faker.datatype.boolean(0.3)) {
    address.addressLine2 = faker.location.secondaryAddress();
  }
  address.city = faker.location.city();
  address.state = faker.location.state();
  address.postalCode = faker.location.zipCode();
  address.country = faker.helpers.arrayElement([
    'US',
    'CA',
    'GB',
    'DE',
    'FR',
    'JP',
    'AU',
  ]);
  if (faker.datatype.boolean(0.7)) {
    address.phone = faker.phone.number();
  }
  address.isDefault = faker.datatype.boolean(0.2);

  return address;
});
