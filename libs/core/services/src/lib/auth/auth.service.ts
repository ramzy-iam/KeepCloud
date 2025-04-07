import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '@keepcloud/core/db';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

const {
  GOOGLE_CLIENT_ID,
  VITE_GOOGLE_CLIENT_ID,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} = process.env;

@Injectable()
export class AuthService {
  private readonly logger: Logger;
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {
    this.logger = new Logger(AuthService.name);
  }

  async validateOrCreateUser(
    code: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = await this.verifyGoogleCode(code);
      const user = await this.userService.createOrUpdateGoogleUser(payload);
      if (!user) {
        throw new InternalServerErrorException('Failed to create/update user');
      }

      return this.generateTokens(user);
    } catch (error: any) {
      this.logger.error(
        `Google authentication failed: ${error.message}`,
        error.stack
      );

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Authentication service unavailable'
      );
    }
  }

  private async verifyGoogleCode(code: string): Promise<TokenPayload> {
    const client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      VITE_GOOGLE_CLIENT_ID,
      'postmessage'
    );

    const { tokens } = await client.getToken(code);
    if (!tokens?.id_token) {
      throw new BadRequestException(
        'Google authentication failed: ID token not found'
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new BadRequestException(
        'Google authentication failed: Invalid token payload'
      );
    }

    if (!payload.email || !payload.email_verified) {
      throw new BadRequestException(
        'Google authentication failed: Email not verified'
      );
    }

    return payload;
  }

  private generateTokens(user: User) {
    const { id: sub, email, picture } = user;
    const payload = { sub, email, picture };
    const accessToken = this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: '1h',
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
        throw new BadRequestException('Refresh token missing');
      }

      const { email, sub }: { sub: number; email: string } =
        this.jwtService.verify(refreshToken, {
          secret: JWT_REFRESH_SECRET,
        });

      const user = await this.userService.findOne({ id: sub, email });
      if (!user) {
        throw new BadRequestException('Invalid refresh token');
      }

      const { accessToken } = this.generateTokens(user);
      return { accessToken };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Invalid refresh token');
    }
  }

  async getUserProfile({ email, id }: { email: string; id: number }) {
    const user = await this.userService.findOne({ email, id });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
