import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Req,
  Get,
} from '@nestjs/common';
import { Request } from 'express';
import {
  AuthService,
  ByPassRLS,
  PublicRoute,
  Serialize,
} from '@keepcloud/core/services';
import { AuthGoogleResponseDto, UserProfileDto } from '@keepcloud/commons/dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @Post('google')
  @Serialize(AuthGoogleResponseDto)
  async googleAuthCallback(@Body() { code }: { code: string }) {
    if (!code) {
      throw new BadRequestException('Authorization code is required');
    }

    return this.authService.validateOrCreateUser(code);
  }

  @PublicRoute()
  @Serialize(AuthGoogleResponseDto)
  @Post('refresh-token')
  async refresh(@Body() { refreshToken }: { refreshToken: string }) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Serialize(UserProfileDto)
  // @ByPassRLS()
  @Get('me')
  getProfile(@Req() req: Request extends { user: infer U } ? U : any) {
    const { email, userId: id } = req.user;
    return this.authService.getUserProfile({ email, id });
  }
}
