import { ApiProperty } from '@nestjs/swagger';

export class WishlistProductDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Gaming Laptop' })
  name: string;

  @ApiProperty({ example: 1299.99 })
  price: number;

  @ApiProperty({ example: 'High-performance gaming laptop' })
  description: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  imageUrl: string;

  @ApiProperty({ example: 10 })
  stock: number;

  @ApiProperty({ example: true })
  isAvailable: boolean;
}

export class WishlistResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ type: [WishlistProductDto] })
  products: WishlistProductDto[];

  @ApiProperty({ example: 5 })
  totalItems: number;
}

export class WishlistCheckDto {
  @ApiProperty({ example: true })
  isInWishlist: boolean;
}

export class WishlistCountDto {
  @ApiProperty({ example: 5 })
  count: number;
}
