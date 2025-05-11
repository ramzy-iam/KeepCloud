import { useQuery, useMutation } from '@tanstack/react-query';
import { ApiError, AuthService } from '../services';
import { AuthHelper } from '../helpers';
import { AuthGoogleResponseDto, UserProfileDto } from '@keepcloud/commons/dtos';
import { authAtom } from '../store';
import { useAtomValue, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { ROUTE_PATH } from '../constants';

export const useGoogleAuth = () => {
  return useMutation<
    AuthGoogleResponseDto,
    ApiError,
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
  const setAuthAtom = useSetAtom(authAtom);
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await AuthService.getProfile();
      setAuthAtom((prev) => ({ ...prev, user: data }));
      return data;
    },
    enabled,
    retry: false,
  });
};

export const useRefreshAccessToken = () => {
  return useMutation<AuthGoogleResponseDto, ApiError>({
    mutationFn: async () => {
      const { data } = await AuthService.refreshToken(AuthHelper.refreshToken);
      AuthHelper.storeTokens({ ...data });
      return data;
    },
    retry: false,
  });
};

export const useAuth = () => {
  const user = useAtomValue(authAtom)?.user as UserProfileDto;
  const [authChecked, setAuthChecked] = useState(false);
  const [redirect, setRedirect] = useState<string | null>(null);
  const { mutateAsync: refreshAccessToken } = useRefreshAccessToken();
  const hasRefreshed = useRef(false);

  const { isLoading } = useGetProfile({
    enabled: AuthHelper.checkIfSessionValid(),
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (hasRefreshed.current) return;
      hasRefreshed.current = true;

      if (!AuthHelper.checkIfSessionValid()) {
        if (AuthHelper.canRefreshToken()) {
          try {
            await refreshAccessToken();
          } catch {
            AuthHelper.clearCookies();
            setRedirect(ROUTE_PATH.login);
          }
        } else {
          AuthHelper.clearCookies();
          setRedirect(ROUTE_PATH.login);
        }
      }
      setAuthChecked(true);
    };

    checkAuth();
  }, [refreshAccessToken]);

  return {
    user,
    authChecked,
    redirect,
    isLoading,
    isAuthenticated: AuthHelper.checkIfSessionValid() && !!user,
  };
};

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = () => {
    AuthHelper.clearCookies();
    navigate('/');
  };

  return { logout };
};
