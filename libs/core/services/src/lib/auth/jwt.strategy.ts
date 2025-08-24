import {
  AppConfigService,
  UnauthorizedException,
} from '@keepcloud/commons/backend';
import { AccessTokenPayload } from '@keepcloud/commons/dtos';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: AppConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.env.JWT_SECRET,
    });
  }

  async validate(payload: AccessTokenPayload) {
    const exception = new UnauthorizedException('Invalid token');
    if (!payload) throw exception;

    const user = await this.userService.findOne({ id: payload.sub });
    if (!user) throw exception;

    return user;
  }
}
