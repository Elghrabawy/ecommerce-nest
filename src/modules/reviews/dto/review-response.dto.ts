import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewAuthorDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatar_url?: string | null;
}

export class ReviewProductDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Gaming Laptop' })
  name: string;

  @ApiProperty({ example: 'gaming-laptop' })
  slug: string;

  @ApiProperty({ example: 1299.99 })
  price: number;

  @ApiPropertyOptional({
    example: ['https://example.com/image1.jpg'],
    type: [String],
  })
  images?: string[];
}

export class ReviewResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  rating: number;

  @ApiPropertyOptional({ example: 'Great product, highly recommend!' })
  comment: string | null;

  @ApiProperty({ example: 1 })
  productId: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiPropertyOptional({ type: ReviewAuthorDto })
  user?: ReviewAuthorDto;

  @ApiPropertyOptional({ type: ReviewProductDto })
  product?: ReviewProductDto;

  @ApiProperty({ example: '2026-03-08T00:00:00.000Z' })
  createdAt: Date;
}
