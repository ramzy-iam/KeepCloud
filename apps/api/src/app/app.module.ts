import { Module } from '@nestjs/common';
import { DatabaseModule } from '@keepcloud/core/db';
import { IamApiModule } from '@keepcloud/iam/api';
import { FileApiModule } from '@keepcloud/files/api';
import { GlobalExceptionFilter } from '@keepcloud/commons/backend';

@Module({
  imports: [DatabaseModule, IamApiModule, FileApiModule],
  providers: [
    {
      provide: 'APP_FILTER',
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
