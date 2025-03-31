import { Module } from '@nestjs/common';
import { DatabaseModule } from '@keepcloud/core/db';

@Module({
  imports: [DatabaseModule],
})
export class AppModule {}
