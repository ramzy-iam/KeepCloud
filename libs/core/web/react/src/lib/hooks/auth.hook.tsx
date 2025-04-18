import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthService } from '../services';
import { AuthHelper } from '../helpers';
import { AxiosError } from 'axios';
import { AuthGoogleResponseDto } from '@keepcloud/commons/dtos';
import { authState } from '../store';
import { useSetAtom } from 'jotai';

export const useGoogleAuth = () => {
  return useMutation<
    AuthGoogleResponseDto,
    Error | AxiosError,
    {
      code: string;
    }
  >({
    mutationFn: async (params) => {
      const { data } = await AuthService.authGoogle(params.code);
      AuthHelper.storeTokens({ ...data });
      return data;
    },
  });
};

export const useGetProfile = () => {
  const setAuthState = useSetAtom(authState);
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await AuthService.getProfile();
      setAuthState((prev) => ({ ...prev, user: data }));
      return data;
    },
    enabled: AuthHelper.checkIfSessionValid(),
    retry: false,
  });
};

export const useLogout = () => {
  const logout = () => {
    AuthHelper.clearCookies();
  };

  return { logout };
};
