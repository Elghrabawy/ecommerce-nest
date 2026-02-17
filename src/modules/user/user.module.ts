import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { AuthModule } from 'src/modules/auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from 'src/common/utils/interceptors/response.interceptor';
import { StorageModule } from '../storage/storage.module';
import { StorageProvider } from 'src/common/utils/enums';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    forwardRef(() => AuthModule),
    StorageModule.register(StorageProvider.MINIO),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor<User> },
  ],
  exports: [UserService],
})
export class UserModule {}
