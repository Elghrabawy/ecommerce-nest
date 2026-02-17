import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { StorageModule } from './modules/storage/storage.module';
import { MailModule } from './modules/mail/mail.module';
import { AddressModule } from './modules/address/address.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ProductModule } from './modules/product/product.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { StorageProvider } from './common/utils/enums';
import dbConfig from './config/db.config';
import minioConfig from './config/minio.config';
import jwtConfig from './config/jwt.config';
import refreshJwtConfig from './config/refresh-jwt.config';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ReviewsModule,
    CartModule,
    OrderModule,
    PaymentModule,
    ProductModule,
    WishlistModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.development`,
      load: [dbConfig, minioConfig, jwtConfig, refreshJwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: dbConfig,
    }),
    StorageModule.register(StorageProvider.MINIO),
    MailModule,
    AddressModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
