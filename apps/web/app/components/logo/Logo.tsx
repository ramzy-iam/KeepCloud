import { useTheme, Env } from '@keepcloud/web-core/react';

export const Logo = ({ className = '' }: { className?: string }) => {
  const { isDarkMode } = useTheme();

  const logoImg = isDarkMode ? (
    <img
      src={'/assets/svg/full-logo-dark.svg'}
      alt="logo"
      width={145}
      height={40}
      className={className}
    />
  ) : (
    <img
      src={'/assets/svg/full-logo-light.svg'}
      alt="logo"
      width={145}
      className={className}
      height={40}
    />
  );

  if (Env.VITE_BETA_MODE) {
    return (
      <div className="relative inline-block">
        {logoImg}
        <span className="absolute -top-2.5 -right-2 rotate-12 transform rounded-full bg-orange-500 px-1.5 py-0.5 text-xs font-bold text-white shadow-lg">
          BETA
        </span>
      </div>
    );
  }

  return logoImg;
};
