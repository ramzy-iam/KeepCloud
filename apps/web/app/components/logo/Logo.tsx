import { useTheme } from '@keepcloud/web-core/react';

export const Logo = ({ className = '' }: { className?: string }) => {
  const { isDarkMode } = useTheme();

  if (isDarkMode)
    return (
      <img
        src={'/assets/svg/full-logo-dark.svg'}
        alt="logo"
        width={145}
        height={40}
        className={className}
      />
    );

  return (
    <img
      src={'/assets/svg/full-logo-light.svg'}
      alt="logo"
      width={145}
      className={className}
      height={40}
    />
  );
};
