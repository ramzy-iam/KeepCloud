import { User, UserRepository } from '@keepcloud/core/db';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user/user.service';
import { AuthService } from './auth';
import { AuthController } from './auth/auth.controller';
import { UserController } from './user/user.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt.strategy';
import { AuthGuard } from './auth/auth.guard';

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
  ],
})
export class IamApiModule {}
