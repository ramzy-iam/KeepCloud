import { APP_GUARD, Reflector } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RLSContextService, UserRepository } from '@keepcloud/core/db';
import {
  UserService,
  AuthService,
  AuthGuard,
  JwtStrategy,
  RLSAuthGuard,
} from '@keepcloud/core/services';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController, UserController],
  providers: [
    UserRepository,
    UserService,
    AuthService,
    AuthGuard,
    JwtStrategy,
    JwtService,
    RLSContextService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RLSAuthGuard,
    },
  ],
})
export class IamApiModule {}
