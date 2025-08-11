import { Logger } from '@nestjs/common';
import { createApp } from './bootstrap';
import { AppConfigService } from '@keepcloud/commons/backend';

async function bootstrap() {
  const app = await createApp();
  const configService = app.get(AppConfigService);
  const port = configService.env.PORT || 3000;

  await app.listen(port);
  Logger.log(`🚀 Application running on http://localhost:${port}/api`);
}

bootstrap();
