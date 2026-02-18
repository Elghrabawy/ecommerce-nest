import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { Address } from './entities/address.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from 'src/common/utils/interceptors/response.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([Address, User]), AuthModule, UserModule],
  controllers: [AddressController],
  providers: [
    AddressService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor<Address>,
    },
  ],
  exports: [AddressService],
})
export class AddressModule {}
