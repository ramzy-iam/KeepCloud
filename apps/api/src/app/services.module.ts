import { ConfigModule } from '@keepcloud/commons/backend';
import {
  FileRepository,
  SubscriptionPlanRepository,
  UserRepository,
} from '@keepcloud/core/db';
import {
  AuthService,
  CurrentUserPipe,
  SystemQueueService,
  SystemQueueWorkerService,
  UserService,
  NestedSetService,
  StorageService,
  MailService,
  NotificationService,
} from '@keepcloud/core/services';
import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const services = [
  // Services
  UserService,
  AuthService,
  StorageService,
  JwtService,
  NestedSetService,
  MailService,
  NotificationService,

  // Repositories
  UserRepository,
  SubscriptionPlanRepository,
  FileRepository,

  // Miscellaneous
  CurrentUserPipe,

  // Queues
  SystemQueueService,

  // Workers
  SystemQueueWorkerService,
];

@Global()
@Module({
  imports: [ConfigModule],
  providers: services,
  exports: services,
})
export class ServicesModule {}
