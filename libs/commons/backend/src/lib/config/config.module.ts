import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';
import { AppConfigService } from './config.service';
import * as z from 'zod/v4';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const result = envSchema.safeParse(config);
        const logger = new Logger(ConfigModule.name);
        if (!result.success) {
          logger.error(
            '❌ Invalid .env configuration:\n',
            z.prettifyError(result.error),
          );
          throw new Error('Invalid environment variables');
        }
        return result.data;
      },
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {}
