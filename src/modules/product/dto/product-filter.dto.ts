import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, MaxLength, Min } from 'class-validator';

export class ProductFilterDto {
  @ApiPropertyOptional({
    description:
      'Name of the product to filter by (partial match, case-insensitive)',
    maxLength: 20,
  })
  @MaxLength(20, { message: 'Name must be at most 20 characters long' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'ID of the category to filter by',
  })
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Minimum price to filter by',
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: 'Minimum price must be a positive number' })
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price to filter by',
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: 'Maximum price must be a positive number' })
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Whether to filter by products that are in stock',
  })
  @IsOptional()
  inStock?: boolean;

  @ApiPropertyOptional({
    description: 'Sort order for the results',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  sorted?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Field to sort the results by',
    enum: ['name', 'price', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  sortedBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
}
