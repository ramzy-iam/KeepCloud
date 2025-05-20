import { AuthGoogleResponseDto, UserProfileDto } from '@keepcloud/commons/dtos';
import { BaseHttpService } from './base.service';

export class AuthService extends BaseHttpService {
  protected baseUrl: string = 'auth';

  async authGoogle(code: string) {
    return this.post<AuthGoogleResponseDto, { code: string }>('/google', {
      code,
    });
  }

  async refreshToken(refreshToken: string) {
    return this.post<AuthGoogleResponseDto, { refreshToken: string }>(
      '/refresh-token',
      { refreshToken },
    );
  }

  async getProfile() {
    return this.get<UserProfileDto>('/me');
  }
}

export default new AuthService();
