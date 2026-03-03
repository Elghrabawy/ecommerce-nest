import { IsInt, IsPositive, IsEnum, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from 'src/common/enums';

export class CreatePaymentSessionDto {
  @ApiProperty({ description: 'Order ID to pay for', example: 1 })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  orderId: number;

  @IsUrl()
  @ApiProperty({
    description: 'URL to redirect after payment completion',
    example: 'https://example.com/payment-success',
  })
  @IsNotEmpty()
  successUrl: string;

  @IsUrl()
  @ApiProperty({
    description: 'URL to redirect if payment is cancelled',
    example: 'https://example.com/payment-cancelled',
  })
  @IsNotEmpty()
  cancelUrl: string;

  @ApiProperty({
    enum: PaymentMethod,
    description: 'Payment method',
    example: PaymentMethod.STRIPE,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;
}
