import { SidebarProvider } from '@keepcloud/web-core/react';
import { Outlet } from 'react-router';

export default function BaseLayout() {
  return (
    <SidebarProvider>
      <Outlet />
    </SidebarProvider>
  );
}
