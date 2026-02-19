import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository, QueryRunner } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../product/entities/product.entity';
import { CartItem } from './entities/cart-item.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async getCartItems(userId: number) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });
    return cart ? cart.items : [];
  }

  async addToCart(userId: number, productId: number, quantity: number) {
    return this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id: productId },
        select: ['id', 'stock'],
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      let cart = await manager.findOne(Cart, {
        where: { user: { id: userId } },
        relations: ['items', 'items.product'],
      });

      if (!cart) {
        if (quantity > product.stock) {
          throw new BadRequestException(
            `Not enough stock available. Requested: ${quantity}, Available: ${product.stock}`,
          );
        }

        cart = manager.create(Cart, {
          user: { id: userId },
          items: [
            manager.create(CartItem, {
              product,
              quantity,
            }),
          ],
        });

        return (await manager.save(Cart, cart)).items ?? [];
      }

      const existingItem = cart.items?.find(
        (item) => item.product.id === productId,
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
          throw new BadRequestException(
            `Not enough stock available. Current cart: ${existingItem.quantity}, Requested: ${quantity}, Available: ${product.stock}`,
          );
        }

        existingItem.quantity = newQuantity;
        await manager.save(CartItem, existingItem);
      } else {
        if (quantity > product.stock) {
          throw new BadRequestException(
            `Not enough stock available. Requested: ${quantity}, Available: ${product.stock}`,
          );
        }

        const newItem = manager.create(CartItem, {
          cart: { id: cart.id },
          product,
          quantity,
        });

        await manager.save(CartItem, newItem);
      }
    });
  }

  async updateCartItem(userId: number, productId: number, quantity: number) {
    return await this.dataSource.transaction(async (manager) => {
      const item = await manager.findOne(CartItem, {
        where: { productId: productId, cart: { userId } },
        relations: ['product'],
        select: ['id', 'product', 'quantity'],
      });

      if (!item) {
        throw new NotFoundException('Cart item not found');
      }
      if (quantity > item.product.stock) {
        throw new BadRequestException(
          `Not enough stock available. Requested: ${quantity}, Available: ${item.product.stock}`,
        );
      }
      item.quantity = quantity;
      await manager.save(CartItem, item);

      return item;
    });
  }

  async removeFromCart(userId: number, productId: number) {
    return this.dataSource.transaction(async (manager) => {
      const item = await manager.findOne(CartItem, {
        where: { productId: productId, cart: { userId } },
        select: ['id'],
      });

      if (!item) {
        throw new BadRequestException('Cart item not found');
      }

      await manager.remove(CartItem, item);
    });
  }

  async clearCart(userId: number) {
    await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: userId },
        select: ['id'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const cart = await manager.findOne(Cart, {
        where: { userId: user.id },
        select: ['id'],
      });

      if (!cart) {
        throw new NotFoundException('Cart not found for user');
      }

      const cartId = cart.id;

      if (!cartId) {
        throw new NotFoundException('Cart not found for user');
      }

      await manager
        .createQueryBuilder(Cart, 'cart')
        .where('id = :cartId', { cartId })
        .delete()
        .execute();
    });

    return true;
  }

  async getCartTotal(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cart = await this.cartRepository.findOne({
      where: { userId: user.id },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found for user');
    }

    const query: { total: number } | undefined = await this.cartItemRepository
      .createQueryBuilder('item')
      .where('item.cartId = :cartId', { cartId: cart.id })
      .innerJoin('item.product', 'product')
      .select('SUM(item.quantity * product.price)', 'total')
      .getRawOne();

    return query?.total ?? 0;
  }
}
