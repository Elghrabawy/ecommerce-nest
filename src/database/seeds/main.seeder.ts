import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { User } from 'src/modules/user/entities/user.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Address } from 'src/modules/address/entities/address.entity';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { CartItem } from 'src/modules/cart/entities/cart-item.entity';
import { Review } from 'src/modules/reviews/entities/review.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { OrderItem } from 'src/modules/order/entities/order-item.entity';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { Wishlist } from 'src/modules/wishlist/entities/wishlist.entity';

export class MainSeeder implements Seeder {
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
    const users = await factoryManager.get(User).saveMany(10);

    // 2. Create Products (50 products)
    console.log('📦 Creating products...');
    const products = await factoryManager.get(Product).saveMany(50);

    // 3. Create Addresses (2-4 per user)
    console.log('🏠 Creating addresses...');
    const addresses: Address[] = [];
    for (const user of users) {
      const addressCount = Math.floor(Math.random() * 3) + 2; // 2-4 addresses
      const userAddresses = await factoryManager
        .get(Address)
        .saveMany(addressCount, { user });
      addresses.push(...userAddresses);
    }

    // 4. Create Carts (1 per user)
    console.log('🛒 Creating carts...');
    const carts: Cart[] = [];
    for (const user of users) {
      const cart = await factoryManager.get(Cart).save({ user });
      carts.push(cart);
    }

    // 5. Create Cart Items (0-5 items per cart)
    console.log('🛍️ Creating cart items...');
    for (const cart of carts) {
      const itemCount = Math.floor(Math.random() * 6); // 0-5 items
      for (let i = 0; i < itemCount; i++) {
        const randomProduct =
          products[Math.floor(Math.random() * products.length)];
        await factoryManager.get(CartItem).save({
          cart,
          product: randomProduct,
        });
      }
    }

    // 6. Create Wishlists (1 per user with 0-10 products)
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

    // 7. Create Reviews (random reviews on products)
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

    // 8. Create Orders (2-5 per user)
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

    // 9. Create Order Items (1-5 items per order)
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

    // 10. Create Payments (1 per order)
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
