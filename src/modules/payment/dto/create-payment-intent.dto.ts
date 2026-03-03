import { IsInt, IsPositive, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from 'src/common/enums';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Order ID to pay for', example: 1 })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({
    enum: PaymentMethod,
    description: 'Payment method',
    example: PaymentMethod.STRIPE,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;
}
