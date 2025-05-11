import { APP_API } from './axios';
import { AuthGoogleResponseDto, UserProfileDto } from '@keepcloud/commons/dtos';

export class AuthService {
  static async authGoogle(code: string) {
    const { data } = await APP_API.post<AuthGoogleResponseDto>('auth/google', {
      code,
    });
    return data;
  }

  static async refreshToken(refreshToken: string) {
    const { data } = await APP_API.post<AuthGoogleResponseDto>(
      'auth/refresh-token',
      {
        refreshToken,
      },
    );
    return data;
  }

  static async getProfile() {
    const { data } = await APP_API.get<UserProfileDto>('auth/me');
    return data;
  }
}
