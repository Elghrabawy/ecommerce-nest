import { registerAs } from '@nestjs/config';
import { ConfigOptions } from 'cloudinary';

import { Logger } from '@nestjs/common';
import './env.loader';

const config = registerAs(
  'cloudinary',
  (): ConfigOptions => ({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  }),
);

export default config;

const logger = new Logger('CloudinaryConfig');
logger.debug('Cloudinary configuration loaded successfully', config);
