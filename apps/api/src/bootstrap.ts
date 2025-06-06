import { ValidationPipe, INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const allowedOrigins = process.env.API_ALLOWED_ORIGIN_LIST.split(',').map(
    (o) => o.trim(),
  );

  app.enableCors({
    origin: allowedOrigins,
    credentials: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
    }),
  );

  return app;
}
