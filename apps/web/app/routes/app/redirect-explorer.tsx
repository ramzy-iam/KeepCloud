import { ROUTE_PATH } from '@keepcloud/web-core/react';
import { Navigate } from 'react-router';

export default function RedirectExplorer() {
  return <Navigate to={ROUTE_PATH.explorer} replace />;
}
