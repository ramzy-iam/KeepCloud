import { Expose } from 'class-transformer';

export class AuthGoogleResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}
