import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Min, Max } from 'class-validator';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../constants';

export class PaginationDto {
  @ApiProperty({
    description: `Page number for pagination (default: ${DEFAULT_PAGE})`,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = DEFAULT_PAGE;

  @ApiProperty({
    description: `Number of items per page for pagination (default: ${DEFAULT_LIMIT}, max: ${MAX_LIMIT})`,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(MAX_LIMIT, { message: `limit cannot exceed ${MAX_LIMIT}` })
  limit?: number = DEFAULT_LIMIT;
}
