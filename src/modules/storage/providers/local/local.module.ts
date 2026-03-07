import { BadRequestException, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from '../../../auth/auth.module';
import { LocalStorageService } from './local.service';
import { LocalStorageController } from './local.controller';

@Module({
  imports: [
    MulterModule.register({
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed!'), false);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
    AuthModule,
  ],
  controllers: [LocalStorageController],
  providers: [LocalStorageService],
})
export class LocalStorageModule {}
