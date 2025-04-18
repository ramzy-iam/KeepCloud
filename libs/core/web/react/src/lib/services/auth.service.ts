import { APP_API } from './axios';
import { AuthGoogleResponseDto, UserProfileDto } from '@keepcloud/commons/dtos';

export class AuthService {
  static authGoogle(code: string) {
    return APP_API.post<AuthGoogleResponseDto>('auth/google', { code });
  }

  static refreshToken(refreshToken: string) {
    return APP_API.post<AuthGoogleResponseDto>('auth/refresh-token', {
      refreshToken,
    });
  }

  static getProfile() {
    return APP_API.get<UserProfileDto>('auth/me');
  }
}
