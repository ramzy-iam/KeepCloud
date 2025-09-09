import { ConfigModule } from '@keepcloud/commons/backend';
import {
  FileLinkRepository,
  FilePermissionRepository,
  FileRepository,
  SubscriptionPlanRepository,
  UserRepository,
} from '@keepcloud/core/db';
import {
  AuthService,
  SystemQueueService,
  SystemQueueWorkerService,
  UserService,
  NestedSetService,
  StorageService,
  MailService,
  NotificationService,
  FileSharingService,
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
  FileSharingService,

  // Repositories
  UserRepository,
  SubscriptionPlanRepository,
  FileRepository,
  FilePermissionRepository,
  FileLinkRepository,

  // Miscellaneous

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
