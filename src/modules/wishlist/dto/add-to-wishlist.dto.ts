import { IsInt, IsPositive, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToWishlistDto {
  @ApiProperty({ description: 'Product ID to add to wishlist', example: 1 })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  productId: number;
}
