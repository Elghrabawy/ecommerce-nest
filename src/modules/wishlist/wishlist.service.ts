import { Injectable } from '@nestjs/common';

@Injectable()
export class WishlistService {

  async getUserWishlist(userId: number) {
    // TODO: Implement get user wishlist
  }

  async addToWishlist(userId: number, productId: number) {
    // TODO: Implement add product to wishlist
  }

  async removeFromWishlist(userId: number, productId: number) {
    // TODO: Implement remove product from wishlist
  }

  async clearWishlist(userId: number) {
    // TODO: Implement clear user wishlist
  }

  async isInWishlist(userId: number, productId: number) {
    // TODO: Implement check if product is in user's wishlist
  }

  async getWishlistCount(userId: number) {
    // TODO: Implement get wishlist items count for user
  }

  async moveToCart(userId: number, productId: number) {
    // TODO: Implement move item from wishlist to cart
  }

  async getWishlistProducts(userId: number) {
    // TODO: Implement get wishlist products with details
  }

  async shareWishlist(userId: number) {
    // TODO: Implement generate shareable wishlist link
  }
}