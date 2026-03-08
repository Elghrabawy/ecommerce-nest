import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';
import { StorageService } from '../../storage.service';
import { MinioConfig } from '../../../../config/minio.config';
import { StorageProvider } from '../../../../common/enums';
import { DeleteFileResponseDto } from '../../dto/delete-file-response.dto';

@Injectable()
export class MinioStorageService implements StorageService {
  private readonly logger = new Logger(MinioStorageService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;
  private readonly minioConfig: MinioConfig;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.minioConfig = this.configService.get<MinioConfig>(
      StorageProvider.MINIO,
    )!;

    if (
      !this.minioConfig.endPoint ||
      !this.minioConfig.port ||
      !this.minioConfig.accessKey ||
      !this.minioConfig.secretKey
    ) {
      this.logger.warn(
        'Minio configuration is incomplete. MinioStorageService will not be initialized properly.',
      );
    }

    this.minioClient = new Minio.Client({
      endPoint: this.minioConfig.endPoint,
      port: this.minioConfig.port,
      useSSL: this.minioConfig.useSSL,
      accessKey: this.minioConfig.accessKey,
      secretKey: this.minioConfig.secretKey,
    });

    this.bucketName = this.minioConfig.bucketName;

    this.baseUrl = this.getPublicUrl('');
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

  async deleteFile(url: string): Promise<DeleteFileResponseDto> {
    this.logger.log(`Attempting to delete file: ${url}`);

    const objectName = this.extractFileName(url);
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`File ${url} deleted successfully`);
      return {
        message: `File ${url} deleted successfully`,
        url,
        provider: StorageProvider.MINIO,
        metadata: {
          objectName,
          bucketName: this.bucketName,
        },
      };
    } catch (error) {
      this.logger.error(`Error deleting file ${url}:`, error);
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

  private extractFileName(url: string): string {
    if (!url.startsWith(this.baseUrl)) {
      throw new Error(
        `URL ${url} does not match expected base URL ${this.baseUrl}`,
      );
    }
    const urlParts = url.replace(this.baseUrl, '').split('/').filter(Boolean);
    const filename = urlParts[urlParts.length - 1];

    return filename;
  }
}
