import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes';

export default [
  route('/', './routes/app/redirect-home.tsx'),
  ...prefix('auth', [index('./routes/auth/login.tsx')]),
  layout('./routes/app/layout.tsx', [
    ...prefix('home', [index('./routes/app/home/explorer.tsx')]),
    ...prefix('folders', [index('./routes/app/folder/folder.tsx')]),
  ]),
] satisfies RouteConfig;
