import { ApiProperty } from '@nestjs/swagger';

export class WishlistProductResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Gaming Laptop' })
  name: string;

  @ApiProperty({ example: 1299.99 })
  price: number;

  @ApiProperty({ example: 'High-performance gaming laptop' })
  description: string;

  @ApiProperty({
    description: 'Array of image URLs',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  images: string[];

  @ApiProperty({ example: 10 })
  stock: number;

  @ApiProperty({ example: true })
  isAvailable: boolean;
}
