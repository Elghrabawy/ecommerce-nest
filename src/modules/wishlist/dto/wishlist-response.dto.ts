import { ApiProperty } from '@nestjs/swagger';
import { WishlistProductResponseDto } from './wishlist-product-response.dto';

export class WishlistResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ type: [WishlistProductResponseDto] })
  products: WishlistProductResponseDto[];

  @ApiProperty({ example: 5 })
  totalItems: number;
}
