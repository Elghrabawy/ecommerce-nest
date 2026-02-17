import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinioStorageService } from './minio.service';
import { MinioController } from './minio.controller';
import minioConfig from '../../../../config/minio.config';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [ConfigModule.forFeature(minioConfig), AuthModule, ConfigModule],
  controllers: [MinioController],
  providers: [MinioStorageService],
  exports: [MinioStorageService],
})
export class MinioStorageModule {}