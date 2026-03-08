import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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
import { CategoryModule } from './modules/category/category.module';
import { StorageProvider } from './common/enums';
import dbConfig from './config/db.config';
import minioConfig from './config/minio.config';
import jwtConfig from './config/jwt.config';
import refreshJwtConfig from './config/refresh-jwt.config';
import stripeConfig from './config/stripe.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import envFile from './config/env.loader';

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
    CategoryModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFile,
      load: [dbConfig, jwtConfig, refreshJwtConfig, stripeConfig],
    }),

    TypeOrmModule.forRootAsync({
      useFactory: dbConfig,
    }),
    StorageModule.register(
      (process.env.STORAGE_PROVIDER as StorageProvider) ||
        StorageProvider.LOCAL,
    ),
    MailModule,
    AddressModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'pages'),
      serveRoot: '/',
      exclude: ['/api/*'],
    }),
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
