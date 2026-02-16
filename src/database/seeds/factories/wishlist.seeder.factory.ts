import { Faker } from '@faker-js/faker';
import { Wishlist } from 'src/modules/wishlist/entities/wishlist.entity';
import { setSeederFactory } from 'typeorm-extension';

export const WishlistFactory = setSeederFactory(Wishlist, (faker: Faker) => {
  const wishlist = new Wishlist();
  // User and Products will be assigned in the seeder
  return wishlist;
});
