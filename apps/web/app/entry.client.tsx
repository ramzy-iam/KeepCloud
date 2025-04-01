/**
 * By default, React Router will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx react-router reveal` ✨
 * For more information, see https://reactrouter.com/explanation/special-files#entryclienttsx
 */

import { HydratedRouter } from 'react-router/dom';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <GoogleOAuthProvider clientId="891323425060-04b3e85k7gl00prd9a4cno5vngtljc7m.apps.googleusercontent.com">
        <HydratedRouter />
      </GoogleOAuthProvider>
    </StrictMode>
  );
});
