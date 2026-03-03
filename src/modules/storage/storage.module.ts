import { DynamicModule, Global, Module } from '@nestjs/common';
import { LocalStorageService } from './providers/local/local.service';
import { LocalStorageModule } from './providers/local/local.module';
import { StorageService } from './storage.service';
import { CloudinaryService } from './providers/cloudinary/cloudinary.service';
import { MinioStorageService } from './providers/minio/minio.service';
import { StorageProvider } from 'src/common/enums';
import { CloudinaryModule } from './providers/cloudinary/cloudinary.module';
import { MinioStorageModule } from './providers/minio/minio.module';

@Global()
@Module({
  imports: [LocalStorageModule, CloudinaryModule, MinioStorageModule],
  controllers: [],
  providers: [],
})
export class StorageModule {
  static register(type: StorageProvider): DynamicModule {
    let storageService: any;

    switch (type) {
      case StorageProvider.LOCAL:
        storageService = LocalStorageService;
        break;
      case StorageProvider.CLOUDINARY:
        storageService = CloudinaryService;
        break;
      case StorageProvider.MINIO:
        storageService = MinioStorageService;
        break;
      default:
        storageService = LocalStorageService;
    }

    return {
      module: StorageModule,
      global: true,
      providers: [{ provide: StorageService, useClass: storageService }],
      exports: [{ provide: StorageService, useClass: storageService }],
    };
  }
}
