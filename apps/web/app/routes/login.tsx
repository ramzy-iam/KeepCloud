import { useGoogleAuth } from '../../libs/hooks';
import { Button, LoginRightContent } from '../components';
import { useGoogleLogin } from '@react-oauth/google';

export default function Login() {
  const { mutate: googleAuth, isPending } = useGoogleAuth();

  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: (tokenResponse) => {
      googleAuth({ code: tokenResponse.code });
    },
  });

  return (
    <div className="grid grid-cols-12 gap-4 p-2 max-h-screen h-screen">
      <LoginRightContent className="hidden md:block md:col-span-6" />
      <div className="col-span-full md:col-span-6 rounded-[12px] relative flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-6 w-full max-w-[360px] md:w-[350px] md:max-w-full">
          <img
            src={'/assets/svg/full-logo-light.svg'}
            alt="logo"
            width={145}
            height={40}
          />
          <h1 className="text-neutral-500 font-semibold text-[32px] leading-[40px]">
            Welcome to{' '}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-[#4C3CC6] to-[#7E60F8]">
              KeepCloud
            </span>
          </h1>
          <div className="w-full mx-auto">
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
        <div className="absolute bottom-0 w-full text-[12px] flex justify-between items-center text-neutral-400">
          <span>&copy; 2025 - KeepCloud All Rights Reserved</span>
          <span>Privacy Policy &#183; Terms & Conditions</span>
        </div>
      </div>
    </div>
  );
}
