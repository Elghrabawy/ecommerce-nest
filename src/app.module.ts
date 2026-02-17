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
import { StorageProvider } from './common/utils/enums';
import dbConfig from './config/db.config';
import minioConfig from './config/minio.config';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ReviewsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.development`,
      load: [dbConfig, minioConfig],
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
