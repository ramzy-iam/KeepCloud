import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes';

export default [
  route('/', './routes/app/redirect-home.tsx'),
  ...prefix('app', [
    ...prefix('auth', [index('./routes/auth/login.tsx')]),
    layout('./routes/app/layout.tsx', [
      index('./routes/app/home/explorer.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
