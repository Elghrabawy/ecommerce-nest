import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  getHello(): string {
    return 'API is running';
  }

  @Get('api/stripe-config')
  getStripeConfig(): { publishableKey: string } {
    return {
      publishableKey: this.config.get<string>('stripe.publishableKey') ?? '',
    };
  }
}
