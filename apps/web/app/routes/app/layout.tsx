import { Outlet } from 'react-router';

import { QuickActionButtons } from '../../components';

export default function Layout() {
  return (
    <>
      <div className="row-span-3 px-2 md:px-8">
        <QuickActionButtons />
      </div>
      <div className="row-span-9 overflow-y-auto px-2 md:px-8">
        <Outlet />
      </div>
    </>
  );
}
