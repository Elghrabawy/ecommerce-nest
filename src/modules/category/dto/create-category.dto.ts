import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Category slug (URL-friendly name)',
    example: 'electronics',
  })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'All electronic items and gadgets',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Category image URL',
    example: 'https://example.com/category-image.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Whether the category is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Sort order for category display',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Parent category ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}
