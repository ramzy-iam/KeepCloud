import { Module } from '@nestjs/common';
import { DatabaseModule } from '@keepcloud/core/db';
import { IamApiModule } from '@keepcloud/iam/api';
import { FileApiModule } from '@keepcloud/files/api';
import { StorageApiModule } from '@keepcloud/storage/api';
import { GlobalExceptionFilter } from '@keepcloud/commons/backend';
import { ServicesModule } from './services.module';
import { ProcessorsModule } from '@keepcloud/processors';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ServicesModule,
    ProcessorsModule,
    IamApiModule,
    FileApiModule,
    StorageApiModule,
  ],
  providers: [
    {
      provide: 'APP_FILTER',
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
