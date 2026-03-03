import { Logger } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { StringValue } from 'ms';
import './env.loader';

const config = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as StringValue,
}));

export default config;

const logger = new Logger('JwtConfig');
logger.debug('JWT configuration loaded successfully', config);
