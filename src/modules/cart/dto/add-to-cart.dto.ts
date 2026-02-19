import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export default class AddToCartDto {
  @ApiProperty({ description: 'ID of the product to add to cart' })
  @IsInt({ message: 'Product ID must be an integer' })
  productId: number;
  @ApiProperty({
    description: 'Quantity of the product to add to cart',
    minimum: 1,
  })
  @IsInt({ message: 'Product ID must be an integer' })
  @Min(1, { message: 'Quantity must be positive value' })
  @Max(9999, { message: 'Quantity exceeds maximum limit' })
  quantity: number;
}
