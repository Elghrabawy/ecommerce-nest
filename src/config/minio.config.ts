import { Logger } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { StorageProvider } from 'src/common/enums';
import './env.loader';

export interface MinioConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  region: string;
}

const config = registerAs(
  StorageProvider.MINIO,
  (): MinioConfig => ({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT!) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true' || false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
    bucketName: process.env.MINIO_BUCKET_NAME || 'uploads',
    region: process.env.MINIO_REGION || 'us-east-1',
  }),
);

export default config;

const logger = new Logger('MinioConfig');
logger.debug('Minio configuration loaded successfully', config);
