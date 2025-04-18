import { Provider } from 'jotai';
import { ThemeProvider } from './components';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <QueryClientProvider client={new QueryClient()}>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            {children}
          </GoogleOAuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Provider>
  );
};
