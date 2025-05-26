import { Logger } from '@nestjs/common';
import { createApp } from './bootstrap';

async function bootstrap() {
  const app = await createApp();
  const port = process.env.PORT || 3000;

  await app.listen(port);
  Logger.log(`🚀 Application running on http://localhost:${port}/api`);
}

bootstrap();
