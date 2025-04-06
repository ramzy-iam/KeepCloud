import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Req,
  Get,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService, PublicRoute } from '@keepcloud/core/services';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @Post('google')
  async googleAuthCallback(@Body() { code }: { code: string }) {
    if (!code) {
      throw new BadRequestException('Authorization code is required');
    }

    return this.authService.validateOrCreateUser(code);
  }

  @PublicRoute()
  @Post('refresh-token')
  async refresh(@Body() { refreshToken }: { refreshToken: string }) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Get('me')
  getProfile(@Req() req: Request extends { user: infer U } ? U : any) {
    const { email, userId: id } = req.user;
    return this.authService.getUserProfile({ email, id });
  }
}
