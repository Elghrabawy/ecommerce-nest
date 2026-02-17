import { Injectable } from '@nestjs/common';

@Injectable()
export class CartService {
  
  async getCartItems(userId: number) {
    // TODO: Implement get cart items for user
  }

  async addToCart(userId: number, productId: number, quantity: number) {
    // TODO: Implement add item to cart
  }

  async updateCartItem(cartItemId: number, quantity: number) {
    // TODO: Implement update cart item quantity
  }

  async removeFromCart(cartItemId: number) {
    // TODO: Implement remove item from cart
  }

  async clearCart(userId: number) {
    // TODO: Implement clear user cart
  }

  async getCartTotal(userId: number) {
    // TODO: Implement calculate cart total
  }

  async getCartItemCount(userId: number) {
    // TODO: Implement get cart item count
  }
}