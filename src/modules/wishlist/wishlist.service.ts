import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Product } from '../product/entities/product.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Get or create user's wishlist
   */
  private async getOrCreateWishlist(userId: number): Promise<Wishlist> {
    let wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
      relations: ['products', 'user'],
    });

    if (!wishlist) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      wishlist = this.wishlistRepository.create({
        user,
        products: [],
      });

      wishlist = await this.wishlistRepository.save(wishlist);
      this.logger.log(`Created new wishlist for user ${userId}`);
    }

    return wishlist;
  }

  /**
   * Get user's wishlist with all products
   */
  async getUserWishlist(userId: number): Promise<Wishlist> {
    const wishlist = await this.getOrCreateWishlist(userId);

    return wishlist;
  }

  /**
   * Add product to user's wishlist
   */
  async addToWishlist(
    userId: number,
    productId: number,
  ): Promise<{ message: string; wishlist: Wishlist }> {
    const wishlist = await this.getOrCreateWishlist(userId);

    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check if product is already in wishlist
    const isAlreadyInWishlist = wishlist.products.some(
      (p) => p.id === productId,
    );

    if (isAlreadyInWishlist) {
      throw new ConflictException(
        `Product with ID ${productId} is already in wishlist`,
      );
    }

    // Add product to wishlist
    wishlist.products.push(product);
    await this.wishlistRepository.save(wishlist);

    this.logger.log(
      `Added product ${productId} to wishlist for user ${userId}`,
    );

    return {
      message: 'Product added to wishlist successfully',
      wishlist,
    };
  }

  /**
   * Remove product from user's wishlist
   */
  async removeFromWishlist(
    userId: number,
    productId: number,
  ): Promise<{ message: string; wishlist: Wishlist }> {
    const wishlist = await this.getOrCreateWishlist(userId);

    // Check if product is in wishlist
    const productIndex = wishlist.products.findIndex((p) => p.id === productId);

    if (productIndex === -1) {
      throw new NotFoundException(
        `Product with ID ${productId} not found in wishlist`,
      );
    }

    // Remove product from wishlist
    wishlist.products.splice(productIndex, 1);
    await this.wishlistRepository.save(wishlist);

    this.logger.log(
      `Removed product ${productId} from wishlist for user ${userId}`,
    );

    return {
      message: 'Product removed from wishlist successfully',
      wishlist,
    };
  }

  /**
   * Clear all items from user's wishlist
   */
  async clearWishlist(
    userId: number,
  ): Promise<{ message: string; count: number }> {
    const wishlist = await this.getOrCreateWishlist(userId);
    const count = wishlist.products.length;

    wishlist.products = [];
    await this.wishlistRepository.save(wishlist);

    this.logger.log(`Cleared wishlist for user ${userId} (${count} items)`);

    return {
      message: 'Wishlist cleared successfully',
      count,
    };
  }

  /**
   * Check if product is in user's wishlist
   */
  async isInWishlist(
    userId: number,
    productId: number,
  ): Promise<{ isInWishlist: boolean }> {
    const wishlist = await this.getOrCreateWishlist(userId);

    const isInWishlist = wishlist.products.some((p) => p.id === productId);

    return { isInWishlist };
  }

  /**
   * Get count of items in user's wishlist
   */
  async getWishlistCount(userId: number): Promise<{ count: number }> {
    const wishlist = await this.getOrCreateWishlist(userId);

    return { count: wishlist.products.length };
  }

  async getWishlistProducts(userId: number): Promise<Product[]> {
    const wishlist = await this.getOrCreateWishlist(userId);

    return wishlist.products;
  }
}
