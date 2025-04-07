import { useTheme } from '../ui';

export const Logo = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isDark)
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
