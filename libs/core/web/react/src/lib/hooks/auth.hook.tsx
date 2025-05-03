import { useQuery, useMutation } from '@tanstack/react-query';
import { AuthService } from '../services';
import { AuthHelper } from '../helpers';
import { AxiosError } from 'axios';
import { AuthGoogleResponseDto } from '@keepcloud/commons/dtos';
import { authState } from '../store';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router';

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

interface GetProfileProps {
  enabled?: boolean;
}
export const useGetProfile = ({ enabled }: GetProfileProps = {}) => {
  const setAuthState = useSetAtom(authState);
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await AuthService.getProfile();
      setAuthState((prev) => ({ ...prev, user: data }));
      return data;
    },
    enabled,
    retry: false,
  });
};

export const useRefreshAccessToken = () => {
  return useMutation<AuthGoogleResponseDto, Error | AxiosError>({
    mutationFn: async () => {
      const { data } = await AuthService.refreshToken(AuthHelper.refreshToken);
      AuthHelper.storeTokens({ ...data });
      return data;
    },
    retry: false,
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = () => {
    AuthHelper.clearCookies();
    navigate('/');
  };

  return { logout };
};
