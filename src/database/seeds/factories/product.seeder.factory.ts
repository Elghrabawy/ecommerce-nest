import { Faker } from '@faker-js/faker';
import { Product } from 'src/modules/product/entities/product.entity';
import { setSeederFactory } from 'typeorm-extension';

export const ProductFactory = setSeederFactory(Product, (faker: Faker) => {
  const product = new Product();
  
  const name = faker.commerce.productName();
  product.name = name;
  product.slug = faker.helpers.slugify(name).toLowerCase();
  product.description = faker.commerce.productDescription();
  product.price = parseFloat(faker.commerce.price({ min: 10, max: 1000 }));
  product.stock = faker.number.int({ min: 0, max: 100 });
  
  // Generate 1-5 product images
  const imageCount = faker.number.int({ min: 1, max: 5 });
  product.images = Array.from({ length: imageCount }, () => 
    faker.image.url({ width: 600, height: 400 })
  );

  return product;
});