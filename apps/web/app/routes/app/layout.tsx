import { Navigate, Outlet } from 'react-router';
import {
  ModeToggle,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  ROUTE_PATH,
  useAuth,
  useInitializeFolderViewMode,
} from '@keepcloud/web-core/react';
import { UserProfileDto } from '@keepcloud/commons/dtos';
import {
  AppDialogsWrapper,
  AppSidebar,
  GlobalSearch,
  QuickActionButtons,
  UserProfileIcon,
} from '../../components';

const LocalSidebarTrigger = () => {
  const { open, openMobile, isMobile } = useSidebar();
  if ((open && !isMobile) || (openMobile && isMobile)) return null;
  return <SidebarTrigger />;
};

const ProfileIcon = ({ user }: { user: UserProfileDto }) => {
  const { isMobile } = useSidebar();
  if (!isMobile) return null;
  return (
    <UserProfileIcon user={user} isIcon avatarClassName="h-[30px] w-[30px]" />
  );
};

export default function Layout() {
  const { user, authChecked, redirect, isLoading } = useAuth();
  useInitializeFolderViewMode();

  if (redirect) return <Navigate to={ROUTE_PATH.login} />;
  if (!authChecked || isLoading) return <div>Loading...</div>;

  return (
    <div className="h-svh overflow-hidden">
      <SidebarProvider className="h-full">
        <AppSidebar user={user} />
        <main className="flex h-full w-full flex-col border-0 border-x border-section-border">
          <div className="flex h-[72px] items-center justify-between border-b border-section-border px-2 py-5 md:px-8">
            <div className="flex items-center gap-2.5 text-14">
              <LocalSidebarTrigger />
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-2.5">
              <ProfileIcon user={user} />
              <ModeToggle />
            </div>
          </div>
          <div className="mb-2 grid h-[calc(100%-72px)] max-h-[calc(100%-72px)] grid-rows-12 overflow-x-hidden">
            <div className="row-span-3 px-2 md:px-8">
              <QuickActionButtons />
            </div>
            <div className="row-span-9 overflow-y-auto px-2 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
        <AppDialogsWrapper />
      </SidebarProvider>
    </div>
  );
}
