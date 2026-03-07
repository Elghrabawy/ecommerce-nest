import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const swaggerDocument = new DocumentBuilder()
    .setTitle('E-commerce API')
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

  const document = SwaggerModule.createDocument(app, swaggerDocument);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      initOAuth: {
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        scopeSeparator: ' ',
        scopes: ['read', 'write', 'admin'],
      },
    },
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js',
    ],
  });

  // use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // to extract only the properties that are defined in the DTOs
      forbidNonWhitelisted: false, // disable throwing error if there are extra properties that are not defined in the DTOs
      transform: true, // to automatically transform payloads to be objects typed according to their DTO classes
    }),
  );

  await app.listen(process.env.PORT ?? 3500);
}

bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});
