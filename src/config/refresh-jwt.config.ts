import { registerAs } from '@nestjs/config';
import { StringValue } from 'ms';
import { Logger } from '@nestjs/common';
import './env.loader';

const config = registerAs('refresh-jwt', () => ({
  secret: process.env.REFRESH_JWT_SECRET,
  expiresIn: (process.env.REFRESH_JWT_EXPIRES_IN || '1h') as StringValue,
}));

export default config;

const logger = new Logger('RefreshJwtConfig');
logger.debug('Refresh JWT configuration loaded successfully', config);
