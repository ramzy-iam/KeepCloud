import { useGoogleLogin } from '@react-oauth/google';
import { LoginRightContent, Logo } from '../../components';

import {
  AuthHelper,
  useGoogleAuth,
  Button,
  ModeToggle,
  ROUTE_PATH,
} from '@keepcloud/web-core/react';
import { Navigate } from 'react-router';

export default function Login() {
  const { mutate: googleAuth, isPending } = useGoogleAuth();

  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: (tokenResponse) => {
      googleAuth({ code: tokenResponse.code });
    },
  });

  if (AuthHelper.checkIfSessionValid()) {
    return <Navigate to={ROUTE_PATH.home} />;
  }

  return (
    <div className="grid h-svh max-h-svh grid-cols-12 gap-4 p-2">
      <LoginRightContent className="hidden md:col-span-6 md:block" />
      <div className="relative col-span-full flex flex-col items-center justify-center rounded-[12px] md:col-span-6">
        <div className="absolute top-0 right-2 flex items-center">
          <ModeToggle />
        </div>
        <div className="flex w-full max-w-[360px] flex-col items-center justify-center gap-6 md:w-[350px] md:max-w-full">
          <Logo />
          <h1 className="text-[32px] leading-[40px] font-semibold text-neutral-500 dark:text-white">
            Welcome to{' '}
            <span className="bg-linear-to-r from-[#4C3CC6] to-[#7E60F8] bg-clip-text text-transparent">
              KeepCloud
            </span>
          </h1>
          <div className="mx-auto w-full">
            <Button
              className="w-full"
              variant="secondary"
              size={'lg'}
              loading={isPending}
              onClick={() => login()}
            >
              <img src={'/assets/svg/google.svg'} alt="google" />
              <span>Connect with Google</span>
            </Button>
          </div>
        </div>
        <div className="dark:text-300 absolute bottom-0 flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-foreground lg:justify-between">
          <span>&copy; 2025 - KeepCloud All Rights Reserved</span>
          <span>Privacy Policy &#183; Terms & Conditions</span>
        </div>
      </div>
    </div>
  );
}
