import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class LocalStorageService implements StorageService {
  private generateFileName(filename: string) {
    return Date.now() + '-' + randomUUID() + '-' + filename;
  }

  async storeFile(file: Express.Multer.File): Promise<void> {
    const uploadPath = join(process.cwd(), 'uploads/images');
    try {
      await fs.access(uploadPath);
    } catch {
      console.log('Creating upload directory at', uploadPath);
      await fs.mkdir(uploadPath, { recursive: true });
    }

    const filename = this.generateFileName(file.originalname);
    const filePath = join(uploadPath, filename);

    await fs.writeFile(filePath, file.buffer);

    file.filename = filename;
    file.path = filePath;
  }

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ filename: string; path: string }> {
    if (!file) {
      throw new BadRequestException('File not provided');
    } else {
      console.log(file);
      await this.storeFile(file);
      return { filename: file.filename, path: file.path };
    }
  }

  async uploadFiles(
    files: Express.Multer.File[],
  ): Promise<{ filename: string; path: string }[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('File not provided');
    } else {
      const returnFiles: { filename: string; path: string }[] = [];
      for (const file of files) {
        if (!file) {
          throw new BadRequestException('File not provided');
        } else {
          await this.storeFile(file);
          returnFiles.push({ filename: file.filename, path: file.path });
        }
      }
      return returnFiles;
    }
  }

  async deleteFile(filename: string): Promise<{ message: string }> {
    const imagePath = join(process.cwd(), 'uploads/images', filename);

    try {
      await fs.unlink(imagePath);
      return { message: `File ${filename} deleted successfully` };
    } catch {
      throw new BadRequestException(`Could not delete file: ${filename}`);
    }
  }
}
