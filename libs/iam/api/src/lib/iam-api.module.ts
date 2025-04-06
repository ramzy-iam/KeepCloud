import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User, UserRepository } from '@keepcloud/core/db';
import {
  UserService,
  AuthService,
  AuthGuard,
  JwtStrategy,
} from '@keepcloud/core/services';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController, UserController],
  providers: [
    UserRepository,
    UserService,
    AuthService,
    AuthGuard,
    JwtStrategy,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class IamApiModule {}
