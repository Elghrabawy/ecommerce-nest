import { Type } from 'class-transformer';
import { IsInt, IsOptional, ValidateNested, IsPositive, ArrayNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({ description: 'Quantity of the product', example: 2 })
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto], description: 'List of items in the order' })
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ description: 'Shipping Address ID', example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  shippingAddressId?: number;

  @ApiPropertyOptional({ description: 'Billing Address ID', example: 2 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  billingAddressId?: number;
}
