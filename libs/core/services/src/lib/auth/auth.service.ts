import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { MailService } from '../notifications/mail.service';
import { FileRepository, User } from '@keepcloud/core/db';
import { TokenPayload } from 'google-auth-library';
import { OAuthService } from './oauth.service';
import { AccessTokenPayload, UserProfileDto } from '@keepcloud/commons/dtos';
import {
  AppConfigService,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@keepcloud/commons/backend';
import { ErrorCode } from '@keepcloud/commons/constants';
import { SystemQueueService } from '../queues';
import { NotificationService } from '../notifications';

@Injectable()
export class AuthService {
  private readonly logger: Logger;

  constructor(
    private readonly userService: UserService,
    private readonly fileRepository: FileRepository,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
    private readonly notificationService: NotificationService,
  ) {
    this.logger = new Logger(AuthService.name);
  }

  async validateOrCreateUser(
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = await this.verifyGoogleCode(code);
      const { user, isNewUser } =
        await this.userService.createOrUpdateGoogleUser(payload);
      if (!user) {
        throw new InternalServerErrorException({
          message: 'Failed to create user',
        });
      }

      // Send welcome email for new users.
      if (isNewUser) {
        try {
          await this.notificationService.sendWelcomeEmail(
            user.email,
            user.firstName,
          );
          this.logger.log(`Welcome email sent to new user: ${user.email}`);
        } catch (emailError: unknown) {
          // Log email error but don't fail authentication
          if (emailError instanceof Error) {
            this.logger.error(
              `Failed to send welcome email to ${user.email}: ${emailError.message}`,
              emailError.stack,
            );
          } else {
            this.logger.error(
              `Failed to send welcome email to ${user.email}: ${String(emailError)}`,
            );
          }
        }
      }

      return this.generateTokens(user);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Google authentication failed: ${errorMessage}`,
        errorStack,
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
      throw new BadRequestException({
        code: ErrorCode.EMAIL_NOT_VERIFIED,
        message: 'Google authentication failed: Email not verified',
      });
    }
    return payload;
  }

  private generateTokens(user: User) {
    const { id: sub, email, picture } = user;
    const payload: AccessTokenPayload = { sub, email, picture };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.env.JWT_SECRET,
      expiresIn: '15d',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.env.JWT_REFRESH_SECRET,
      expiresIn: '15d',
    });
    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new BadRequestException({
          code: ErrorCode.INVALID_INPUT,
          message: 'Invalid refresh token',
        });
      }

      const { email, sub }: { sub: string; email: string } =
        this.jwtService.verify(refreshToken, {
          secret: this.configService.env.JWT_REFRESH_SECRET,
        });

      const user = await this.userService.findOne({ id: sub, email });
      if (!user) {
        throw new BadRequestException({
          code: ErrorCode.INVALID_INPUT,
          message: 'Invalid refresh token',
        });
      }

      const { accessToken } = this.generateTokens(user);
      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException({
        code: ErrorCode.INVALID_INPUT,
        message: 'Invalid refresh token',
      });
    }
  }

  async getUserProfile({
    email,
    id,
  }: {
    email: string;
    id: string;
  }): Promise<UserProfileDto> {
    const user = await this.userService.findOne({ email, id });
    if (!user) {
      throw new UnauthorizedException({ message: 'Invalid token' });
    }
    const rootFolder = await this.fileRepository.getRootFolder(user.id);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
      root: rootFolder.id,
    };
  }
}
