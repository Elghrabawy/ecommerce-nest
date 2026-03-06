import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { User } from 'src/modules/user/entities/user.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { Address } from 'src/modules/address/entities/address.entity';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { CartItem } from 'src/modules/cart/entities/cart-item.entity';
import { Review } from 'src/modules/reviews/entities/review.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { OrderItem } from 'src/modules/order/entities/order-item.entity';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { Wishlist } from 'src/modules/wishlist/entities/wishlist.entity';
import { UserRole } from 'src/common';

export class MainSeeder implements Seeder {
  private async createCategories(dataSource: DataSource): Promise<Category[]> {
    console.log('📂 Creating categories...');
    const categoryRepo = dataSource.getTreeRepository(Category);

    // Create main categories
    const electronics = new Category();
    electronics.name = 'Electronics';
    electronics.slug = 'electronics';
    electronics.description = 'Electronic devices and gadgets';
    electronics.image =
      'https://via.placeholder.com/400x300/007bff/ffffff?text=Electronics';
    electronics.isActive = true;
    electronics.sortOrder = 1;

    const clothing = new Category();
    clothing.name = 'Clothing';
    clothing.slug = 'clothing';
    clothing.description = 'Fashion and apparel for all ages';
    clothing.image =
      'https://via.placeholder.com/400x300/28a745/ffffff?text=Clothing';
    clothing.isActive = true;
    clothing.sortOrder = 2;

    const home = new Category();
    home.name = 'Home & Garden';
    home.slug = 'home-garden';
    home.description = 'Home improvement and garden supplies';
    home.image = 'https://via.placeholder.com/400x300/17a2b8/ffffff?text=Home';
    home.isActive = true;
    home.sortOrder = 3;

    const sports = new Category();
    sports.name = 'Sports & Outdoors';
    sports.slug = 'sports-outdoors';
    sports.description = 'Sporting goods and outdoor equipment';
    sports.image =
      'https://via.placeholder.com/400x300/ffc107/ffffff?text=Sports';
    sports.isActive = true;
    sports.sortOrder = 4;

    // Save main categories
    const savedElectronics = await categoryRepo.save(electronics);
    const savedClothing = await categoryRepo.save(clothing);
    const savedHome = await categoryRepo.save(home);
    const savedSports = await categoryRepo.save(sports);

    // Create subcategories for Electronics
    const phones = categoryRepo.create({
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones and accessories',
      image: 'https://via.placeholder.com/400x300/6c757d/ffffff?text=Phones',
      isActive: true,
      sortOrder: 1,
      parent: savedElectronics,
    });

    const laptops = categoryRepo.create({
      name: 'Laptops',
      slug: 'laptops',
      description: 'Notebooks and portable computers',
      image: 'https://via.placeholder.com/400x300/6c757d/ffffff?text=Laptops',
      isActive: true,
      sortOrder: 2,
      parent: savedElectronics,
    });

    const accessories = categoryRepo.create({
      name: 'Accessories',
      slug: 'electronics-accessories',
      description: 'Electronic accessories and peripherals',
      image:
        'https://via.placeholder.com/400x300/6c757d/ffffff?text=Accessories',
      isActive: true,
      sortOrder: 3,
      parent: savedElectronics,
    });

    // Create subcategories for Clothing
    const menClothing = categoryRepo.create({
      name: "Men's Clothing",
      slug: 'mens-clothing',
      description: 'Fashion for men',
      image: 'https://via.placeholder.com/400x300/343a40/ffffff?text=Men',
      isActive: true,
      sortOrder: 1,
      parent: savedClothing,
    });

    const womenClothing = categoryRepo.create({
      name: "Women's Clothing",
      slug: 'womens-clothing',
      description: 'Fashion for women',
      image: 'https://via.placeholder.com/400x300/e83e8c/ffffff?text=Women',
      isActive: true,
      sortOrder: 2,
      parent: savedClothing,
    });

    const shoes = categoryRepo.create({
      name: 'Shoes',
      slug: 'shoes',
      description: 'Footwear for all occasions',
      image: 'https://via.placeholder.com/400x300/fd7e14/ffffff?text=Shoes',
      isActive: true,
      sortOrder: 3,
      parent: savedClothing,
    });

    // Save subcategories
    const savedPhones = await categoryRepo.save(phones);
    const savedLaptops = await categoryRepo.save(laptops);
    const savedAccessories = await categoryRepo.save(accessories);
    const savedMenClothing = await categoryRepo.save(menClothing);
    const savedWomenClothing = await categoryRepo.save(womenClothing);
    const savedShoes = await categoryRepo.save(shoes);

    // Return all categories for product assignment
    return [
      savedElectronics,
      savedClothing,
      savedHome,
      savedSports,
      savedPhones,
      savedLaptops,
      savedAccessories,
      savedMenClothing,
      savedWomenClothing,
      savedShoes,
    ];
  }

  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    // Check if data already exists
    const userRepo = dataSource.getRepository(User);
    const existingUsers = await userRepo.count();
    if (existingUsers > 0) {
      console.log('Data already exists, skipping seeding.');
      return;
    }

    console.log('🌱 Starting seeding process...');

    // 1. Create Users (10 users)
    console.log('👤 Creating users...');
    const borhom = await factoryManager.get(User).save({
      name: 'Borhom',
      email: 'borhom@gmail.com',
      password_hash: 'Password@123',
      role: UserRole.ADMIN,
    });

    const users = [borhom];
    users.push(...(await factoryManager.get(User).saveMany(9, {})));

    // 2. Create Categories with hierarchical structure
    const allCategories = await this.createCategories(dataSource);

    // 3. Create Products (50 products) with categories
    console.log('📦 Creating products...');
    const products: Product[] = [];
    for (let i = 0; i < 50; i++) {
      const randomCategory =
        allCategories[Math.floor(Math.random() * allCategories.length)];
      const product = await factoryManager
        .get(Product)
        .save({ category: randomCategory });
      products.push(product);
    }

    // 4. Create Addresses (2-4 per user)
    console.log('🏠 Creating addresses...');
    const addresses: Address[] = [];
    for (const user of users) {
      const addressCount = Math.floor(Math.random() * 3) + 2; // 2-4 addresses
      const userAddresses = await factoryManager
        .get(Address)
        .saveMany(addressCount, { user });
      addresses.push(...userAddresses);
    }

    // 5. Create Carts (1 per user)
    console.log('🛒 Creating carts...');
    const carts: Cart[] = [];
    for (const user of users) {
      const cart = await factoryManager.get(Cart).save({ user });
      carts.push(cart);
    }

    // 6. Create Cart Items (0-5 items per cart)
    console.log('🛍️ Creating cart items...');
    for (const cart of carts) {
      const itemCount = Math.floor(Math.random() * 6); // 0-5 items
      const usedProducts = new Set<number>(); // Track products already in this cart
      
      for (let i = 0; i < itemCount; i++) {
        // Keep trying until we find a product not yet in this cart
        let randomProduct;
        let attempts = 0;
        do {
          randomProduct = products[Math.floor(Math.random() * products.length)];
          attempts++;
          // Break if we've tried too many times (shouldn't happen with 50 products)
          if (attempts > 100) break;
        } while (usedProducts.has(randomProduct.id));
        
        // Only add if we found a unique product
        if (!usedProducts.has(randomProduct.id)) {
          await factoryManager.get(CartItem).save({
            cart,
            product: randomProduct,
          });
          usedProducts.add(randomProduct.id);
        }
      }
    }

    // 7. Create Wishlists (1 per user with 0-10 products)
    console.log('💝 Creating wishlists...');
    for (const user of users) {
      const wishlist = await factoryManager.get(Wishlist).save({ user });

      // Add random products to wishlist
      const productCount = Math.floor(Math.random() * 11); // 0-10 products
      const shuffled = products.sort(() => 0.5 - Math.random());
      const selectedProducts = shuffled.slice(0, productCount);

      if (selectedProducts.length > 0) {
        wishlist.products = selectedProducts;
        await dataSource.getRepository(Wishlist).save(wishlist);
      }
    }

    // 8. Create Reviews (random reviews on products)
    console.log('⭐ Creating reviews...');
    for (let i = 0; i < 200; i++) {
      // 200 total reviews
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomProduct =
        products[Math.floor(Math.random() * products.length)];

      // Check if user already reviewed this product
      const existingReview = await dataSource.getRepository(Review).findOne({
        where: {
          user: { id: randomUser.id },
          product: { id: randomProduct.id },
        },
      });

      if (!existingReview) {
        await factoryManager.get(Review).save({
          user: randomUser,
          product: randomProduct,
        });
      }
    }

    // 9. Create Orders (2-5 per user)
    console.log('📋 Creating orders...');
    const orders: Order[] = [];
    for (const user of users) {
      const orderCount = Math.floor(Math.random() * 4) + 2; // 2-5 orders
      const userAddresses = addresses.filter(
        (addr) => addr.user.id === user.id,
      );

      for (let i = 0; i < orderCount; i++) {
        const shippingAddress =
          userAddresses[Math.floor(Math.random() * userAddresses.length)];
        const billingAddress =
          Math.random() > 0.5
            ? shippingAddress
            : userAddresses[Math.floor(Math.random() * userAddresses.length)];

        const order = await factoryManager.get(Order).save({
          user,
          shippingAddress,
          billingAddress,
        });
        orders.push(order);
      }
    }

    // 10. Create Order Items (1-5 items per order)
    console.log('📦 Creating order items...');
    let totalOrderValue = 0;
    for (const order of orders) {
      const itemCount = Math.floor(Math.random() * 5) + 1; // 1-5 items
      let orderTotal = 0;

      for (let i = 0; i < itemCount; i++) {
        const randomProduct =
          products[Math.floor(Math.random() * products.length)];
        const orderItem = await factoryManager.get(OrderItem).save({
          order,
          product: randomProduct,
        });
        orderTotal += orderItem.priceAtPurchase * orderItem.quantity;
      }

      // Update order total
      order.totalAmount = orderTotal;
      await dataSource.getRepository(Order).save(order);
      totalOrderValue += orderTotal;
    }

    // 11. Create Payments (1 per order)
    console.log('💳 Creating payments...');
    for (const order of orders) {
      await factoryManager.get(Payment).save({
        order,
        amount: order.totalAmount,
      });
    }

    console.log('✅ Seeding completed successfully!');
    console.log(`📊 Summary:
    - Users: ${users.length}
    - Products: ${products.length}
    - Addresses: ${addresses.length}
    - Carts: ${carts.length}
    - Orders: ${orders.length}
    - Total Order Value: $${totalOrderValue.toFixed(2)}`);
  }
}
