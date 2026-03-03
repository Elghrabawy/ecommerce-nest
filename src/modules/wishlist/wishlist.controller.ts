import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import Auth from '../auth/decorators/auth.decorator';
import { Wishlist } from './entities/wishlist.entity';
import { Product } from '../product/entities/product.entity';
import { ResponseInterceptor } from 'src/common';

@ApiTags('wishlist')
@Controller('wishlist')
@Auth()
@UseInterceptors(ResponseInterceptor<Wishlist | Product[]>)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  async getWishlist(@CurrentUser() user: User): Promise<Wishlist> {
    return this.wishlistService.getUserWishlist(user.id);
  }

  @Get('products')
  @ApiOperation({ summary: 'Get wishlist products with full details' })
  async getWishlistProducts(@CurrentUser() user: User): Promise<Product[]> {
    return this.wishlistService.getWishlistProducts(user.id);
  }

  @Post('add/:productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  async addToWishlist(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() user: User,
  ): Promise<{ message: string; wishlist: Wishlist }> {
    return this.wishlistService.addToWishlist(user.id, productId);
  }

  @Delete('remove/:productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  async removeFromWishlist(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() user: User,
  ): Promise<{ message: string; wishlist: Wishlist }> {
    return this.wishlistService.removeFromWishlist(user.id, productId);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear wishlist' })
  async clearWishlist(
    @CurrentUser() user: User,
  ): Promise<{ message: string; count: number }> {
    return this.wishlistService.clearWishlist(user.id);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Check if product is in wishlist' })
  async isInWishlist(
    @Param('productId', ParseIntPipe) productId: number,
    @CurrentUser() user: User,
  ): Promise<{ isInWishlist: boolean }> {
    return this.wishlistService.isInWishlist(user.id, productId);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get wishlist items count' })
  async getWishlistCount(
    @CurrentUser() user: User,
  ): Promise<{ count: number }> {
    return this.wishlistService.getWishlistCount(user.id);
  }
}
