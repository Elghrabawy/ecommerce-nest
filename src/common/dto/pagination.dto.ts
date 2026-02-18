import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Min, Max, IsInt } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'Page number for pagination (default: 1)',
    required: false,
  })
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page for pagination (default: 20)',
    required: false,
  })
  @IsOptional()
  @Min(1)
  @Max(100, { message: 'limit cannot exceed 100' })
  limit?: number = 20;
}
