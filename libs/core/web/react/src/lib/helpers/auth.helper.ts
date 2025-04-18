import { ACCESS_TOKEN, REFRESH_TOKEN } from '@keepcloud/commons/constants';
import { CookiesHelper } from './cookies.helper';

export class AuthHelper {
  static checkIfSessionValid(): boolean {
    const accessToken = CookiesHelper.get(ACCESS_TOKEN);

    if (!accessToken || typeof accessToken !== 'string') {
      return false;
    }

    try {
      const payloadBase64 = accessToken.split('.')[1];
      if (!payloadBase64) {
        return false;
      }

      const payload = JSON.parse(atob(payloadBase64));
      const exp = payload.exp;

      if (!exp || typeof exp !== 'number') {
        return false;
      }

      return exp >= (new Date().getTime() + 1) / 1000;
    } catch (error) {
      return false;
    }
  }

  static clearCookies() {
    const domainOptions = {
      path: '/',
      domain: import.meta.env['VITE_DOMAIN_NAME'],
    };
    CookiesHelper.remove(ACCESS_TOKEN, domainOptions);
    CookiesHelper.remove(REFRESH_TOKEN, domainOptions);
  }

  static storeTokens(data: { accessToken: string; refreshToken: string }) {
    const { accessToken, refreshToken } = data;
    CookiesHelper.set(ACCESS_TOKEN, accessToken);
    CookiesHelper.set(REFRESH_TOKEN, refreshToken);
  }
}
