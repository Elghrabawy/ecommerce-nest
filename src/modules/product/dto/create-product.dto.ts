import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  MinLength,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'iPhone 14 Pro',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Product slug (URL-friendly name)',
    example: 'iphone-14-pro',
  })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Latest iPhone with advanced camera system',
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: 999.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'Product stock quantity',
    example: 50,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  stock: number;

  @ApiPropertyOptional({
    description: 'Product images URLs',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Category ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;
}
