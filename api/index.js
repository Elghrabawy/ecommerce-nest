const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const { AppModule } = require('../dist/app.module');
const { ValidationPipe } = require('@nestjs/common');

const expressApp = express();
let nestApp;

async function bootstrap() {
  if (!nestApp) {
    const adapter = new ExpressAdapter(expressApp);
    
    nestApp = await NestFactory.create(AppModule, adapter, {
      rawBody: true,
      logger: ['error', 'warn', 'log'],
    });

    nestApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );

    nestApp.enableCors();
    await nestApp.init();
  }
  return expressApp;
}

module.exports = async (req, res) => {
  const app = await bootstrap();
  app(req, res);
};
