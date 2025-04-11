import {
  type RouteConfig,
  index,
  layout,
  prefix,
} from '@react-router/dev/routes';

export default [
  ...prefix('auth', [index('./routes/auth/login.tsx')]),
  ...prefix('app', [
    layout('./routes/app/layout.tsx', [index('./routes/app/home.tsx')]),
  ]),
] satisfies RouteConfig;
