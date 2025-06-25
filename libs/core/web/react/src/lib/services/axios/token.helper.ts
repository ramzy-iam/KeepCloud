import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import { CookiesHelper } from '../../helpers';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@keepcloud/commons/constants';
import { AuthHelper } from '../../helpers/auth.helper';
import { Env } from '../config';

let tokenRefreshPromise: Promise<string | undefined> | null = null;

/**
 * Internal function to refresh the access token.
 * Ensures only one refresh request is made at a time.
 */
const refreshTokenInternal = async (): Promise<string | undefined> => {
  // If a refresh request is already in progress, return the existing promise
  if (tokenRefreshPromise) return tokenRefreshPromise;

  tokenRefreshPromise = (async () => {
    const refreshToken = CookiesHelper.get(REFRESH_TOKEN);

    if (!refreshToken) {
      redirectToLogin();
      return undefined;
    }

    const axiosInstance = axios.create({
      baseURL: Env.VITE_API_BASE_URL,
    });

    try {
      const { data } = await axiosInstance.post('/auth/refresh-token', {
        refreshToken,
      });

      const newAccessToken = data.accessToken.jwtToken;
      CookiesHelper.set(ACCESS_TOKEN, newAccessToken);
      return newAccessToken;
    } catch (error) {
      AuthHelper.clearCookies();
      redirectToLogin();
      return undefined;
    }
  })();

  try {
    return await tokenRefreshPromise;
  } finally {
    tokenRefreshPromise = null;
  }
};

export const renewAccessToken = async (
  originalAxiosInstance?: AxiosInstance,
  config?: AxiosRequestConfig,
): Promise<void | AxiosResponse<any> | string> => {
  const newAccessToken = await refreshTokenInternal();

  if (!newAccessToken) {
    return;
  }

  // If an originalAxiosInstance and config are provided, retry the request with the new token
  if (originalAxiosInstance && config) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${newAccessToken}`,
    };
    return originalAxiosInstance(config);
  }

  return newAccessToken;
};

const redirectToLogin = () => {
  window.location.href = Env.VITE_WEB_APP_URL;
};
