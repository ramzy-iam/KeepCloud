import {
  AppConfigService,
  UnauthorizedException,
} from '@keepcloud/commons/backend';
import { AccessTokenPayload } from '@keepcloud/commons/dtos';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.env.JWT_SECRET,
    });
  }

  async validate(payload: AccessTokenPayload) {
    if (!payload) {
      throw new UnauthorizedException({ message: 'Invalid token' });
    }
    return payload;
  }
}
