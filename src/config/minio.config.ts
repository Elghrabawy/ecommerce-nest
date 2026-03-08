import { Logger } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { StorageProvider } from '../common/enums';
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
    endPoint: process.env.MINIO_ENDPOINT!,
    port: parseInt(process.env.MINIO_PORT!),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY!,
    secretKey: process.env.MINIO_SECRET_KEY!,
    bucketName: process.env.MINIO_BUCKET_NAME!,
    region: process.env.MINIO_REGION!,
  }),
);

export default config;

const logger = new Logger('MinioConfig');
logger.debug('Minio configuration loaded successfully', config);
