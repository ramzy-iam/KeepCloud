import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DatabaseModule, RLSContextService } from '@keepcloud/core/db';
import { IamApiModule } from '@keepcloud/iam/api';
import { FileApiModule } from '@keepcloud/files/api';
import { StorageApiModule } from '@keepcloud/storage/api';
import { GlobalExceptionFilter } from '@keepcloud/commons/backend';
import { ServicesModule } from './services.module';
import { RLSContextMiddleware } from '@keepcloud/core/services';

@Module({
  imports: [
    DatabaseModule,
    ServicesModule,
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
    consumer.apply(RLSContextMiddleware).forRoutes('*');
  }
}
