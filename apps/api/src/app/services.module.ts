import { SubscriptionPlanRepository, UserRepository } from '@keepcloud/core/db';
import {
  AuthService,
  CurrentUserPipe,
  UserService,
} from '@keepcloud/core/services';
import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

const services = [
  // Services
  UserService,
  AuthService,
  JwtService,

  // Repositories
  UserRepository,
  SubscriptionPlanRepository,

  // Miscellaneous
  CurrentUserPipe,
];

@Global()
@Module({
  providers: services,
  exports: services,
})
export class ServicesModule {}
