import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { AddressModule } from '../address/address.module';
import { Product } from '../product/entities/product.entity';
import { User } from '../user/entities/user.entity';
import { Address } from '../address/entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, User, Address]),
    ProductModule,
    UserModule,
    AuthModule,
    AddressModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
