import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Req,
  type RawBodyRequest,
  Headers,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import Auth from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { User } from '../user/entities/user.entity';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getPayments() {
    return this.paymentService.getAllPayments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  async getPaymentById(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.getPaymentById(id);
  }

  @Post('create-intent')
  @ApiOperation({ summary: 'Create a Stripe payment intent for an order' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
  })
  @Auth()
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDto,
    @CurrentUser() user: User,
  ) {
    return this.paymentService.createPaymentIntent(user.id, dto);
  }

  @Post('create-session')
  @ApiOperation({ summary: 'Create a Stripe checkout session for an order' })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created successfully',
  })
  @Auth()
  async createCheckoutSession(
    @Body() dto: CreatePaymentSessionDto,
    @CurrentUser() user: User,
  ) {
    // TODO: Implement create checkout session
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  async refundPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() refundDto: any,
  ) {
    // TODO: Implement refund payment
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payments by order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order payments retrieved successfully',
  })
  async getPaymentsByOrderId(@Param('orderId', ParseIntPipe) orderId: number) {
    // TODO: Implement get payments by order ID
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiResponse({
    status: 200,
    description: 'Payment status updated successfully',
  })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: any,
  ) {
    // TODO: Implement update payment status
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
