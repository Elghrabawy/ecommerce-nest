import { registerAs } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import './env.loader';

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  currency: string;
  publishableKey: string;
}

const config = registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: process.env.STRIPE_CURRENCY || 'usd',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
}));

export default config;

const logger = new Logger('StripeConfig');
logger.debug('Stripe configuration loaded successfully', config);
