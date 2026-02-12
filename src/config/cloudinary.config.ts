import { registerAs } from '@nestjs/config';
import { ConfigOptions } from 'cloudinary';

export default registerAs(
  'cloudinary',
  (): ConfigOptions => ({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
    api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
    api_secret: process.env.CLOUDINARY_API_SECRET,
  }),
);
