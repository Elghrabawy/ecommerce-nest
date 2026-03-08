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
import {
  WishlistCheckDto,
  WishlistCountDto,
  WishlistProductResponseDto,
  WishlistResponseDto,
} from './dto';

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
   * Helper method to convert Wishlist entity to WishlistResponseDto
   * @param wishlist - Wishlist entity to convert
   * @returns
   */
  private ParseToResponseDto(wishlist: Wishlist): WishlistResponseDto {
    const wishlistResponse: WishlistResponseDto = {
      id: wishlist.id,
      userId: wishlist.user.id,
      products: wishlist.products.map(
        (product): WishlistProductResponseDto => ({
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          images: product.images,
          stock: product.stock,
          isAvailable: product.stock > 0,
        }),
      ),
      totalItems: wishlist.products.length,
    };

    return wishlistResponse;
  }

  /**
   * Get or create user's wishlist
   * @param userId - ID of the user
   * @return WishlistResponseDto - The user's wishlist with product details
   */
  private async getOrCreateWishlist(
    userId: number,
  ): Promise<WishlistResponseDto> {
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

    return this.ParseToResponseDto(wishlist);
  }

  /**
   * Get user's wishlist with all products
   * @param userId - ID of the user
   * @returns WishlistResponseDto - The user's wishlist with product details
   */
  async getUserWishlist(userId: number): Promise<WishlistResponseDto> {
    return await this.getOrCreateWishlist(userId);
  }

  /**
   * Add product to user's wishlist
   * @param userId - ID of the user
   * @param productId - ID of the product to add
   * @returns WishlistResponseDto - Updated wishlist after adding the product
   */
  async addToWishlist(
    userId: number,
    productId: number,
  ): Promise<WishlistResponseDto> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
      relations: ['products', 'user'],
    });

    // Check if wishlist exists
    if (!wishlist) {
      throw new NotFoundException(`Wishlist for user ID ${userId} not found`);
    }

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    // Check if product exists
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

    return this.ParseToResponseDto(wishlist);
  }

  /**
   * Remove product from user's wishlist
   * @param userId - ID of the user
   * @param productId - ID of the product to remove
   * @returns WishlistResponseDto - Updated wishlist after removing the product
   */
  async removeFromWishlist(
    userId: number,
    productId: number,
  ): Promise<WishlistResponseDto> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
      relations: ['products', 'user'],
    });

    if (!wishlist) {
      throw new NotFoundException(`Wishlist for user ID ${userId} not found`);
    }

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

    return this.ParseToResponseDto(wishlist);
  }

  /**
   * Clear all items from user's wishlist
   * @param userId - ID of the user
   * @returns Object containing a success message and the count of items removed from the wishlist
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
   * @param userId - ID of the user
   * @param productId - ID of the product to check
   * @returns Object indicating whether the product is in the wishlist
   */
  async isInWishlist(
    userId: number,
    productId: number,
  ): Promise<WishlistCheckDto> {
    const wishlist = await this.getOrCreateWishlist(userId);

    const isInWishlist = wishlist.products.some((p) => p.id === productId);

    return { isInWishlist };
  }

  /**
   * Get count of items in user's wishlist
   * @param userId - ID of the user
   * @returns Object containing the count of items in the wishlist
   */
  async getWishlistCount(userId: number): Promise<WishlistCountDto> {
    const wishlist = await this.getOrCreateWishlist(userId);

    return { count: wishlist.products.length };
  }

  /**
   * Get wishlist products with full details
   * @param userId - ID of the user
   * @returns Array of products in the user's wishlist with full details
   */
  async getWishlistProducts(
    userId: number,
  ): Promise<WishlistProductResponseDto[]> {
    const wishlist = await this.getOrCreateWishlist(userId);

    return wishlist.products;
  }
}
