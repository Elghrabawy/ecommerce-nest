import { Faker } from '@faker-js/faker';
import { Category } from 'src/modules/category/entities/category.entity';
import { setSeederFactory } from 'typeorm-extension';

export const CategoryFactory = setSeederFactory(Category, (faker: Faker) => {
  const category = new Category();

  const name = faker.commerce.department();
  category.name = name;
  category.slug = faker.helpers.slugify(name).toLowerCase();
  category.description = faker.lorem.sentences(2);
  category.image = faker.image.url({ width: 400, height: 300 });
  category.isActive = faker.datatype.boolean({ probability: 0.9 }); // 90% active
  category.sortOrder = faker.number.int({ min: 0, max: 100 });

  return category;
});
