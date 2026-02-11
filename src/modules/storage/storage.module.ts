import { DynamicModule, Module } from '@nestjs/common';
import { LocalStorageService } from './providers/local/local.service';
import { LocalStorageModule } from './providers/local/local.module';
import { StorageService } from './storage.service';
import { CloudinaryService } from './providers/cloudinary/cloudinary.service';
import { StorageProvider } from 'src/common/utils/enums';
import { CloudinaryModule } from './providers/cloudinary/cloudinary.module';

@Module({
  imports: [LocalStorageModule, CloudinaryModule],
  controllers: [],
  providers: [],
})
export class StorageModule {
  static register(type: StorageProvider): DynamicModule {
    const storageService =
      type === StorageProvider.LOCAL ? LocalStorageService : CloudinaryService;

    return {
      module: StorageModule,
      providers: [{ provide: StorageService, useClass: storageService }],
      exports: [{ provide: StorageService, useClass: storageService }],
    };
  }
}
