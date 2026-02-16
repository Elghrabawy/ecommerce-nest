import { Faker } from '@faker-js/faker';
import { User } from 'src/modules/user/entities/user.entity';
import { setSeederFactory } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/common/utils/enums';

export const UserFactory = setSeederFactory(User, (faker: Faker) => {
  const user = new User();

  user.name = faker.person.fullName();
  user.email = faker.internet.email().toLowerCase();

  user.role = faker.datatype.boolean(0.1) ? UserRole.ADMIN : UserRole.USER;

  const password = 'Password@123';
  const saltRounds = 10;
  user.password_hash = bcrypt.hashSync(password, saltRounds);

  // Sometimes add an avatar URL (70% chance)
  if (faker.datatype.boolean(0.7)) {
    user.avatar_url = faker.image.avatar();
  }

  return user;
});
