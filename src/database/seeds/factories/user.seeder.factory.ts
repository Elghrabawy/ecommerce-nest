import { Faker } from '@faker-js/faker';
import { User } from 'src/modules/user/entities/user.entity';
import { setSeederFactory } from 'typeorm-extension';
import { UserRole } from 'src/common/utils/enums';

export const UserFactory = setSeederFactory(User, (faker: Faker) => {
  const user = new User();

  user.name = faker.person.fullName();
  user.email = faker.internet.email().toLowerCase();

  user.role = faker.datatype.boolean(0.1) ? UserRole.ADMIN : UserRole.USER;
  user.password_hash = 'Password@123';

  // Sometimes add an avatar URL (70% chance)
  if (faker.datatype.boolean(0.7)) {
    user.avatar_url = faker.image.avatar();
  }

  return user;
});
