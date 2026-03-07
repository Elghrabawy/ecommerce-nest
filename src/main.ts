import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedServer: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

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

  // use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // to extract only the properties that are defined in the DTOs
      forbidNonWhitelisted: false, // disable throwing error if there are extra properties that are not defined in the DTOs
      transform: true, // to automatically transform payloads to be objects typed according to their DTO classes
    }),
  );

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerDocument);
  SwaggerModule.setup('api', app, documentFactory);

  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function (req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  return cachedServer(req, res);
}

if (!process.env.VERCEL) {
  bootstrap().then((instance) => {
    instance.listen(process.env.PORT ?? 3000, () => {
      console.log(`Application is running on port ${process.env.PORT ?? 3000}`);
    });
  }).catch((err) => {
    console.error('Error starting application:', err);
    process.exit(1);
  });
}
