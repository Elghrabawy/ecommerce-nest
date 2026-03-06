const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
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

    // Enable CORS first
    nestApp.enableCors();

    nestApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );

    // Setup Swagger
    const swaggerDocument = new DocumentBuilder()
      .setTitle('First NestJS API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(nestApp, swaggerDocument);
    
    // Serve Swagger JSON
    expressApp.get('/api-json', (req, res) => {
      res.json(document);
    });
    
    // Setup Swagger UI
    SwaggerModule.setup('api', nestApp, document, {
      swaggerOptions: {
        persistAuthorization: true,
        url: '/api-json',
      },
      customSiteTitle: 'First NestJS API Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
      customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    });

    await nestApp.init();
  }
  return expressApp;
}

module.exports = async (req, res) => {
  const app = await bootstrap();
  app(req, res);
};
