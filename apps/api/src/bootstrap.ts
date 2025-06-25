import { ValidationPipe, INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Env } from '@keepcloud/commons/backend';

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const allowedOrigins = Env.API_ALLOWED_ORIGIN_LIST.split(',').map((o) =>
    o.trim(),
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
