import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleAuthCallback(@Body() { code }: { code: string }) {
    if (!code) {
      throw new BadRequestException('Authorization code is required');
    }

    return this.authService.validateOrCreateUser(code);
  }

  @Post('refresh-token')
  async refresh(@Body() { refreshToken }: { refreshToken: string }) {
    return this.authService.refreshAccessToken(refreshToken);
  }
}
