import {
  BadRequestException,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import AuthRoles from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/utils/enums';
import { FileUploadDto } from 'src/modules/storage/dto/file-upload.dto';
import { FilesUploadDto } from 'src/modules/storage/dto/files-upload.dto';
import { MinioStorageService } from './minio.service';

@ApiTags('MinIO Storage')
@Controller('storage/minio')
export class MinioController {
  constructor(private readonly storageService: MinioStorageService) {}

  @Post('upload-image')
  @AuthRoles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File',
    type: FileUploadDto,
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File not provided');
    }
    return this.storageService.uploadFile(file);
  }

  @Post('upload-images')
  @AuthRoles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'List of files',
    type: FilesUploadDto,
  })
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Files not provided');
    }
    return this.storageService.uploadFiles(files);
  }

  @Delete(':filename')
  @AuthRoles(UserRole.ADMIN)
  deleteFile(@Param('filename') filename: string) {
    return this.storageService.deleteFile(filename);
  }
}
