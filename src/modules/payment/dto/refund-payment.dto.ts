import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefundPaymentDto {
  @ApiPropertyOptional({
    description: 'Reason for the refund',
    example: 'Customer requested refund',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
