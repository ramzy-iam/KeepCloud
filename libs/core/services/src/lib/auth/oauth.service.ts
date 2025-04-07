import { BadRequestException } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

const { VITE_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

export class OAuthService {
  private static client: OAuth2Client = new OAuth2Client(
    VITE_GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'postmessage'
  );

  static async verifyGoogleCode(code: string): Promise<TokenPayload> {
    const client = OAuthService.client;

    const { tokens } = await client.getToken(code);
    if (!tokens?.id_token) {
      throw new BadRequestException(
        'Google authentication failed: ID token not found'
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: VITE_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new BadRequestException(
        'Google authentication failed: Invalid token payload'
      );
    }

    return payload;
  }
}
