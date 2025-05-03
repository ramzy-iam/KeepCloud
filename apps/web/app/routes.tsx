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
    ...prefix('home', [
      index('./routes/app/redirect-explorer.tsx'),
      route('/explorer', './routes/app/home/explorer.tsx'),
      route('/shared-with-me', './routes/app/home/shared-with-me.tsx'),
    ]),
    ...prefix('folders', [
      index('./routes/app/folder/folder.tsx'),
      route('/:folderId', './routes/app/folder/details.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
