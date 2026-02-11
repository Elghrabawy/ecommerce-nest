import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import AuthRoles from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/utils/enums';
import type { Response } from 'express';
import { LocalStorageService } from './local.service';
import { FileUploadDto } from 'src/modules/storage/dto/file-upload.dto';
import { FilesUploadDto } from 'src/modules/storage/dto/files-upload.dto';

@Controller('storage/local')
export class LocalStorageController {
  constructor(private readonly storageService: LocalStorageService) {}

  @Get(':filename')
  getFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      return res.sendFile(filename, { root: './uploads/images' });
    } catch {
      throw new BadRequestException(`Could not fetch file: ${filename}`);
    }
  }

  @Post('upload-image')
  @AuthRoles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'List of cats',
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
    description: 'List of cats',
    type: FilesUploadDto,
  })
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('File not provided');
    }
    return this.storageService.uploadFiles(files);
  }

  @Delete(':filename')
  @AuthRoles(UserRole.ADMIN)
  deleteFile(@Param('filename') filename: string) {
    return this.storageService.deleteFile(filename);
  }
}
