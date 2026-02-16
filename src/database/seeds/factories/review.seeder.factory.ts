import { Faker } from '@faker-js/faker';
import { Review } from 'src/modules/reviews/entities/review.entity';
import { setSeederFactory } from 'typeorm-extension';

export const ReviewFactory = setSeederFactory(Review, (faker: Faker) => {
  const review = new Review();

  review.rating = faker.number.int({ min: 1, max: 5 });
  review.comment = faker.datatype.boolean(0.8)
    ? faker.lorem.paragraph({ min: 1, max: 3 })
    : null;

  return review;
});
