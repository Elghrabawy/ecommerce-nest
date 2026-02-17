import { registerAs } from '@nestjs/config';
import { StringValue } from 'ms';

export default registerAs('refresh-jwt', () => ({
  secret: process.env.REFRESH_JWT_SECRET,
  expiresIn: (process.env.REFRESH_JWT_EXPIRES_IN || '1h') as StringValue,
}));
