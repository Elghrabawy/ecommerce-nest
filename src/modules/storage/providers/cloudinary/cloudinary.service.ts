import { Injectable, Inject } from '@nestjs/common';
import { StorageService } from '../../storage.service';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { randomUUID } from 'crypto';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService implements StorageService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinary: typeof v2) {}

  private generateFileName(filename: string) {
    return Date.now() + '-' + randomUUID() + '-' + filename;
  }

  async upload(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinary.uploader.upload_stream(
        { folder: 'uploads' },
        (error, result) => {
          if (error) return reject(error);

          if (!result) {
            return reject(new Error('Cloudinary upload result is undefined'));
          }

          resolve(result);
        },
      );

      // upload.end(file.buffer);
      Promise.resolve(streamifier.createReadStream(file.buffer).pipe(upload));
    });
  }

  async storeFile(file: Express.Multer.File): Promise<void> {}

  async uploadFile(file: Express.Multer.File): Promise<{
    filename: string;
    path: string;
  }> {
    console.log('uploadFile called');
    const uploaded = await this.upload(file);

    return { filename: uploaded.url as string, path: uploaded.url as string };
  }

  async uploadFiles(
    files: Express.Multer.File[],
  ): Promise<{ filename: string; path: string }[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return (await Promise.all(uploadPromises)) as {
      filename: string;
      path: string;
    }[];
  }

  async deleteFile(filename: string): Promise<{ message: string }> {
    throw new Error('Method not implemented.');
  }
}
