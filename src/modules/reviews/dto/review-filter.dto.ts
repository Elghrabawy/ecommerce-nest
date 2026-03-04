import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewFilterDto {
  @ApiProperty({
    description: 'Filter by specific rating (1-5)',
    required: false,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({
    description: 'Filter by minimum rating',
    required: false,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiProperty({
    description: 'Filter by maximum rating',
    required: false,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  maxRating?: number;

  @ApiProperty({
    description: 'Search text in review comments (partial match)',
    required: false,
  })
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Field to sort the results by',
    enum: ['rating', 'createdAt', 'updatedAt'],
    required: false,
  })
  @IsOptional()
  sortBy?: 'rating' | 'createdAt' | 'updatedAt';

  @ApiProperty({
    description: 'Sort order for the results',
    enum: ['asc', 'desc'],
    required: false,
  })
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
