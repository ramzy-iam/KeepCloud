import { Module } from '@nestjs/common';
import { DatabaseModule } from '@keepcloud/core/db';
import { IamApiModule } from '@keepcloud/iam/api';

@Module({
  imports: [DatabaseModule, IamApiModule],
})
export class AppModule {}
