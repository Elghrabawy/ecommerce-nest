import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeProvider } from './providers/stripe.provider';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { AuthModule } from '../auth/auth.module';
import stripeConfig from 'src/config/stripe.config';
import { OrderItem } from '../order/entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, Product, OrderItem]),
    ConfigModule.forFeature(stripeConfig),
    AuthModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, StripeProvider],
  exports: [PaymentService, StripeProvider],
})
export class PaymentModule {}
