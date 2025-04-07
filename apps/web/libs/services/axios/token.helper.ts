import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../constants';
import { cookiesHelper } from '../../helpers';

let tokenRefreshPromise: Promise<string | undefined> | null = null;

/**
 * Internal function to refresh the access token.
 * Ensures only one refresh request is made at a time.
 */
const refreshTokenInternal = async (): Promise<string | undefined> => {
  // If a refresh request is already in progress, return the existing promise
  if (tokenRefreshPromise) return tokenRefreshPromise;

  tokenRefreshPromise = (async () => {
    const refreshToken = cookiesHelper.get(REFRESH_TOKEN);

    if (!refreshToken) {
      redirectToLogin();
      return undefined;
    }

    const axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
    });

    try {
      const { data } = await axiosInstance.post('/auth/refresh-token', {
        refreshToken,
      });

      const newAccessToken = data.accessToken.jwtToken;
      cookiesHelper.set(ACCESS_TOKEN, newAccessToken);
      return newAccessToken;
    } catch (error) {
      clearAuthCookies();
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
  config?: AxiosRequestConfig
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

const clearAuthCookies = () => {
  const domainOptions = {
    path: '/',
    domain: import.meta.env['VITE_DOMAIN_NAME'],
  };
  cookiesHelper.remove(ACCESS_TOKEN, domainOptions);
  cookiesHelper.remove(REFRESH_TOKEN, domainOptions);
};

const redirectToLogin = () => {
  window.location.href = import.meta.env.VITE_WEB_APP_URL;
};
