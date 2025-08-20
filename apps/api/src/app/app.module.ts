import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DatabaseModule } from '@keepcloud/core/db';
import { IamApiModule } from '@keepcloud/iam/api';
import { FileApiModule } from '@keepcloud/files/api';
import { StorageApiModule } from '@keepcloud/storage/api';
import { GlobalExceptionFilter } from '@keepcloud/commons/backend';
import { ServicesModule } from './services.module';
// RLS removed for simplified file sharing approach
// import { RLSContextMiddleware } from '@keepcloud/core/services';
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // RLS middleware removed for simplified approach with user-level filtering
    // consumer.apply(RLSContextMiddleware).forRoutes('*');
  }
}
