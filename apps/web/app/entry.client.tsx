import { HydratedRouter } from 'react-router/dom';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Providers } from './providers';

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <Providers>
        <HydratedRouter />
      </Providers>
    </StrictMode>,
  );
});
