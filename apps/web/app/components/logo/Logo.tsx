import { useTheme } from '@keepcloud/web-core/react';

export const Logo = () => {
  const { isDarkMode } = useTheme();

  if (isDarkMode)
    return (
      <img
        src={'/assets/svg/full-logo-dark.svg'}
        alt="logo"
        width={145}
        height={40}
      />
    );

  return (
    <img
      src={'/assets/svg/full-logo-light.svg'}
      alt="logo"
      width={145}
      height={40}
    />
  );
};
