import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { ProcessorProvider } from '@keepcloud/core/services';
import { PrismaService, RLSContextService } from '@keepcloud/core/db';

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors({ origin: '*' });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
    }),
  );

  return app;
}

export async function initAppAndExecuteProcessor(
  message: string,
  data: unknown,
) {
  const app = await createApp();
  const prismaService = app.get(PrismaService);
  RLSContextService.runWithContext(
    { prisma: prismaService.getClient() },
    async () => {
      const processorProvider = app.get(ProcessorProvider);
      const processor = processorProvider.getFromMessage(message);
      return await processor.execute(data);
    },
  );
}
