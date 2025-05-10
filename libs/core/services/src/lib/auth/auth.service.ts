import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '@keepcloud/core/db';
import { TokenPayload } from 'google-auth-library';
import { OAuthService } from './oauth.service';
import { AccessTokenPayload } from '@keepcloud/commons/dtos';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@keepcloud/commons/backend';
import { ErrorCode } from '@keepcloud/commons/constants';

const { JWT_REFRESH_SECRET, JWT_SECRET } = process.env;

@Injectable()
export class AuthService {
  private readonly logger: Logger;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    this.logger = new Logger(AuthService.name);
  }

  async validateOrCreateUser(
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = await this.verifyGoogleCode(code);
      const user = await this.userService.createOrUpdateGoogleUser(payload);
      if (!user) {
        throw new InternalServerErrorException(
          ErrorCode.INTERNAL_SERVER_ERROR,
          'Failed to create user',
        );
      }

      return this.generateTokens(user);
    } catch (error: any) {
      this.logger.error(
        `Google authentication failed: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'Authentication service unavailable',
      );
    }
  }

  private async verifyGoogleCode(code: string): Promise<TokenPayload> {
    const payload = await OAuthService.verifyGoogleCode(code); // Updated to call static method
    if (!payload.email || !payload.email_verified) {
      throw new BadRequestException(
        ErrorCode.EMAIL_NOT_VERIFIED,
        'Google authentication failed: Email not verified',
      );
    }
    return payload;
  }

  private generateTokens(user: User) {
    const { id: sub, email, picture } = user;
    const payload: AccessTokenPayload = { sub, email, picture };
    const accessToken = this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      // expiresIn: '1h',
      expiresIn: '15d',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: JWT_REFRESH_SECRET,
      expiresIn: '15d',
    });
    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new BadRequestException(
          ErrorCode.INVALID_INPUT,
          'Invalid refresh token',
        );
      }

      const { email, sub }: { sub: string; email: string } =
        this.jwtService.verify(refreshToken, {
          secret: JWT_REFRESH_SECRET,
        });

      const user = await this.userService.findOne({ id: sub, email });
      if (!user) {
        throw new BadRequestException(
          ErrorCode.INVALID_INPUT,
          'Invalid refresh token',
        );
      }

      const { accessToken } = this.generateTokens(user);
      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        ErrorCode.INVALID_INPUT,
        'Invalid refresh token',
      );
    }
  }

  async getUserProfile({ email, id }: { email: string; id: string }) {
    const user = await this.userService.findOne({ email, id });
    if (!user) {
      throw new UnauthorizedException(ErrorCode.UNAUTHORIZED, 'Invalid token');
    }
    return user;
  }
}
