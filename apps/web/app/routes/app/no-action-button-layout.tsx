import { Outlet } from 'react-router';

export default function NoActionButtonLayout() {
  return (
    <div className="row-span-12 overflow-y-auto px-2 md:px-8">
      <Outlet />
    </div>
  );
}
