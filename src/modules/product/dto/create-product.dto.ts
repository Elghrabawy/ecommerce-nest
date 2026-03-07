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
      'https://www.apple.com/newsroom/images/product/iphone/geo/Apple-iPhone-14-iPhone-14-Plus-hero-220907-geo_Full-Bleed-Image.jpg.xlarge.jpg',
      'https://2b.com.eg/media/catalog/product/cache/661473ab953cdcdf4c3b607144109b90/i/p/iphone14-6_xgrpghvpmml1eprf.jpg',
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
