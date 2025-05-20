import { UnauthorizedException } from '@keepcloud/commons/backend';
import { ErrorCode } from '@keepcloud/commons/constants';
import { AccessTokenPayload } from '@keepcloud/commons/dtos';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: AccessTokenPayload) {
    if (!payload) {
      throw new UnauthorizedException(ErrorCode.UNAUTHORIZED, 'Invalid token');
    }
    return payload;
  }
}
