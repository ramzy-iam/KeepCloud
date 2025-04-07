import { APP_API } from './axios';

export interface AuthGoogleResponse {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static authGoogle(code: string) {
    return APP_API.post<AuthGoogleResponse>('auth/google', { code });
  }

  static refreshToken(refreshToken: string) {
    return APP_API.post<AuthGoogleResponse>('auth/refresh-token', {
      refreshToken,
    });
  }

  static getProfile() {
    return APP_API.get('auth/me');
  }
}
