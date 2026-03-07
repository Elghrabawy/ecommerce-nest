import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  type RawBodyRequest,
  Headers,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import Auth from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { User } from '../user/entities/user.entity';
import AuthRoles from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @AuthRoles(UserRole.ADMIN)
  async getPayments() {
    return this.paymentService.getAllPayments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @AuthRoles(UserRole.ADMIN)
  async getPaymentById(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.getPaymentById(id);
  }

  @Post('create-intent')
  @ApiOperation({ summary: 'Create a Stripe payment intent for an order' })
  @Auth()
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDto,
    @CurrentUser() user: User,
  ) {
    return this.paymentService.createPaymentIntent(user.id, dto);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund payment' })
  @AuthRoles(UserRole.ADMIN)
  async refundPayment(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.refundPayment(id);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payments by order ID' })
  @Auth()
  async getPaymentByOrderId(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() user: User,
  ) {
    return this.paymentService.getPaymentByOrderId(orderId, user.id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.paymentService.handleWebhook(req.rawBody!, signature);
    return { received: true };
  }
}
