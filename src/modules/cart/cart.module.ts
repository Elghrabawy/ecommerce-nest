import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Product } from '../product/entities/product.entity';
import { ProductModule } from '../product/product.module';
import { CartItem } from './entities/cart-item.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Cart, Product, CartItem, User]),
    ProductModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
