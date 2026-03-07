import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';
import { StorageService } from '../../storage.service';
import { MinioConfig } from '../../../../config/minio.config';
import { StorageProvider } from '../../../../common/enums';

@Injectable()
export class MinioStorageService implements StorageService {
  private readonly logger = new Logger(MinioStorageService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;
  private readonly minioConfig: MinioConfig;

  constructor(private readonly configService: ConfigService) {
    this.minioConfig = this.configService.get<MinioConfig>(
      StorageProvider.MINIO,
    )!;

    this.minioClient = new Minio.Client({
      endPoint: this.minioConfig.endPoint,
      port: this.minioConfig.port,
      useSSL: this.minioConfig.useSSL,
      accessKey: this.minioConfig.accessKey,
      secretKey: this.minioConfig.secretKey,
    });

    this.bucketName = this.minioConfig.bucketName;
  }

  async storeFile(file: Express.Multer.File): Promise<void> {
    const filename = this.generateFileName(file.originalname);

    try {
      await this.minioClient.putObject(
        this.bucketName,
        filename,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      this.logger.log(`File ${filename} uploaded successfully`);
    } catch (error) {
      this.logger.error(`Error uploading file ${filename}:`, error);
      throw error;
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{
    filename: string;
    path: string;
  }> {
    const filename = this.generateFileName(file.originalname);

    try {
      await this.minioClient.putObject(
        this.bucketName,
        filename,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      const fileUrl = this.getPublicUrl(filename);

      this.logger.log(`File ${filename} uploaded successfully`);

      return {
        filename,
        path: fileUrl,
      };
    } catch (error) {
      this.logger.error(`Error uploading file ${filename}:`, error);
      throw error;
    }
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<
    {
      filename: string;
      path: string;
    }[]
  > {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  async deleteFile(filename: string): Promise<any> {
    try {
      await this.minioClient.removeObject(this.bucketName, filename);
      this.logger.log(`File ${filename} deleted successfully`);
      return {
        success: true,
        message: `File ${filename} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(`Error deleting file ${filename}:`, error);
      throw error;
    }
  }

  private generateFileName(originalName: string): string {
    const fileExtension = originalName.split('.').pop();
    const fileName = `${randomUUID()}.${fileExtension}`;
    return fileName;
  }

  private getPublicUrl(filename: string): string {
    const protocol = this.minioConfig.useSSL ? 'https' : 'http';
    const port =
      this.minioConfig.port === 80 || this.minioConfig.port === 443
        ? ''
        : `:${this.minioConfig.port}`;

    return `${protocol}://${this.minioConfig.endPoint}${port}/${this.bucketName}/${filename}`;
  }
}
