import { Provider } from 'jotai';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Env, ThemeProvider, store } from '@keepcloud/web-core/react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <GoogleOAuthProvider clientId={Env.VITE_GOOGLE_CLIENT_ID}>
            {children}
          </GoogleOAuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Provider>
  );
};
