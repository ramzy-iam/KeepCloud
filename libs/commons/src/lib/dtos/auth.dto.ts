import { Expose } from 'class-transformer';

export class AuthGoogleResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}

export class AccessTokenPayload {
  /**
   *User Id
   */
  @Expose()
  sub: string;

  @Expose()
  email: string;

  @Expose()
  picture: string | null;
}
