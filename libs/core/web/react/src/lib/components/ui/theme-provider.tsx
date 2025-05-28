import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  selectedTheme: Theme;
  isDarkMode: boolean;
};

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
  selectedTheme: 'system',
  isDarkMode: false,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(() => {
    if (selectedTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return selectedTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const newResolved =
        selectedTheme === 'system'
          ? systemDark.matches
            ? 'dark'
            : 'light'
          : selectedTheme;

      root.classList.remove('light', 'dark');
      root.classList.add(newResolved);
      setResolvedTheme(newResolved);
    };

    updateTheme();

    if (selectedTheme === 'system') {
      systemDark.addEventListener('change', updateTheme);
      return () => {
        systemDark.removeEventListener('change', updateTheme);
      };
    }
  }, [selectedTheme]);

  const handleSetTheme = (theme: Theme) => {
    localStorage.setItem(storageKey, theme);
    setSelectedTheme(theme);
  };

  const value: ThemeProviderState = {
    theme: resolvedTheme,
    setTheme: handleSetTheme,
    selectedTheme,
    isDarkMode: resolvedTheme === 'dark',
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
