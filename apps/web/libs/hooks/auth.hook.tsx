import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthGoogleResponse, AuthService } from '../services';
import { cookiesHelper } from '../helpers';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import { AxiosError } from 'axios';

const storeTokens = (data: { accessToken: string; refreshToken: string }) => {
  const { accessToken, refreshToken } = data;
  cookiesHelper.set(ACCESS_TOKEN, accessToken);
  cookiesHelper.set(REFRESH_TOKEN, refreshToken);
};

const clearTokens = () => {
  cookiesHelper.remove(ACCESS_TOKEN);
  cookiesHelper.remove(REFRESH_TOKEN);
};

export const useGoogleAuth = () => {
  return useMutation<
    AuthGoogleResponse,
    Error | AxiosError,
    {
      code: string;
    }
  >({
    mutationFn: async (params) => {
      const { data } = await AuthService.authGoogle(params.code);
      storeTokens({ ...data });
      return data;
    },
  });
};

export const useLogout = () => {
  const logout = () => {
    clearTokens();
  };

  return { logout };
};
