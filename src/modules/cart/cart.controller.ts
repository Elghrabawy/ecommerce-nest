import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import Auth from '../auth/decorators/auth.decorator';
import AddToCartDto from './dto/add-to-cart.dto';
import { ResponseInterceptor } from 'src/common/interceptors';

@ApiTags('cart')
@Controller('cart')
@Auth()
@UseInterceptors(ResponseInterceptor<any>)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cart items' })
  async getCartItems(@CurrentUser() user: User) {
    return this.cartService.getCartItems(user.id);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add item to cart' })
  async addToCart(
    @Body() addToCartDto: AddToCartDto,
    @CurrentUser() user: User,
  ) {
    return this.cartService.addToCart(
      user.id,
      addToCartDto.productId,
      addToCartDto.quantity,
    );
  }

  @Put('/update')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateCartItem(
    @Body() updateDto: AddToCartDto,
    @CurrentUser() user: User,
  ) {
    return this.cartService.updateCartItem(
      user.id,
      updateDto.productId,
      updateDto.quantity,
    );
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeFromCart(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() user: User,
  ) {
    return this.cartService.removeFromCart(user.id, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@CurrentUser() user: User) {
    return this.cartService.clearCart(user.id);
  }

  @Get('total')
  @ApiOperation({ summary: 'Get cart total price' })
  async getCartTotal(@CurrentUser() user: User) {
    return this.cartService.getCartTotal(user.id);
  }
}
