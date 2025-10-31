import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
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
import { NotificationService } from '../notifications';
import { FolderService } from '../folder';

@Injectable()
export class AuthService {
  private readonly logger: Logger;

  constructor(
    private readonly userService: UserService,
    private readonly fileRepository: FileRepository,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
    private readonly notificationService: NotificationService,
    private readonly folderService: FolderService,
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

      // Handle new user setup
      if (isNewUser) {
        // Send welcome email for new users
        try {
          await this.notificationService.sendWelcomeEmail(
            user.email,
            user.firstName,
          );
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

        // Create initial folder structure if enabled
        if (this.configService.env.CREATE_INITIAL_FOLDERS_ON_SIGNUP) {
          try {
            await this.createInitialUserFolders(user.id);
            this.logger.log(
              `Created initial folder structure for new user: ${user.email}`,
            );
          } catch (folderError: unknown) {
            // Log folder creation error but don't fail authentication
            if (folderError instanceof Error) {
              this.logger.error(
                `Failed to create initial folders for ${user.email}: ${folderError.message}`,
                folderError.stack,
              );
            } else {
              this.logger.error(
                `Failed to create initial folders for ${user.email}: ${String(folderError)}`,
              );
            }
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
      expiresIn: this.configService.env.JWT_SECRET_EXPIRES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.env.JWT_REFRESH_SECRET,
      expiresIn: this.configService.env.JWT_REFRESH_SECRET_EXPIRES_IN,
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

  private async createInitialUserFolders(userId: string): Promise<void> {
    this.logger.log(`Creating initial folders for user: ${userId}`);

    // Predefined folder structure with 17 folders in nested arrangement
    const folderStructure = [
      // Root level folders
      { name: 'Documents', parentPath: [] },
      { name: 'Photos', parentPath: [] },
      { name: 'Projects', parentPath: [] },
      { name: 'Archives', parentPath: [] },
      { name: 'Videos', parentPath: [] },
      { name: 'Memory', parentPath: [] },

      // Second level folders under Documents
      { name: 'Personal', parentPath: ['Documents'] },
      { name: 'Work', parentPath: ['Documents'] },
      { name: 'Finance', parentPath: ['Documents'] },

      // Second level folders under Photos
      { name: 'Family', parentPath: ['Photos'] },
      { name: 'Travel', parentPath: ['Photos'] },

      // Second level folders under Projects
      { name: 'Active', parentPath: ['Projects'] },
      { name: 'Completed', parentPath: ['Projects'] },

      // Third level folders
      { name: 'Contracts', parentPath: ['Documents', 'Work'] },
      { name: 'Reports', parentPath: ['Documents', 'Work'] },
      { name: 'Vacation 2025', parentPath: ['Photos', 'Travel'] },
      { name: 'Web Development', parentPath: ['Projects', 'Active'] },
    ];

    const createdFolders = new Map<string, string>();

    for (const folderDef of folderStructure) {
      try {
        let parentId: string | undefined = undefined;

        if (folderDef.parentPath.length > 0) {
          const parentPath = folderDef.parentPath.join('/');
          parentId = createdFolders.get(parentPath);

          if (!parentId) {
            this.logger.warn(
              `Parent folder not found for path: ${parentPath}, skipping folder: ${folderDef.name}`,
            );
            continue;
          }
        }

        // Create the folder
        const folder = await this.folderService.create({
          name: folderDef.name,
          parentId,
          ownerId: userId,
        });

        // Store the folder ID for potential child folders
        const currentPath = [...folderDef.parentPath, folderDef.name].join('/');
        createdFolders.set(currentPath, folder.id);

        this.logger.log(
          `Created folder: ${folderDef.name} (${folder.id}) under parent: ${parentId || 'root'}`,
        );
      } catch (folderError: unknown) {
        const errorMessage =
          folderError instanceof Error ? folderError.message : 'Unknown error';
        this.logger.error(
          `Failed to create folder ${folderDef.name}: ${errorMessage}`,
        );
        // Continue with other folders even if one fails
      }
    }

    this.logger.log(
      `Successfully created initial folder structure for user: ${userId}`,
    );
  }
}
