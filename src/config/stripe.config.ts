import { registerAs } from '@nestjs/config';

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  currency: string;
  publishableKey: string;
}

export default registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: process.env.STRIPE_CURRENCY || 'usd',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
}));
