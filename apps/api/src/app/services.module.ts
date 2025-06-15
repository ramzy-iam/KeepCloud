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
} from '@keepcloud/core/services';
import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const services = [
  // Services
  UserService,
  AuthService,
  JwtService,
  NestedSetService,

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
  providers: services,
  exports: services,
})
export class ServicesModule {}
