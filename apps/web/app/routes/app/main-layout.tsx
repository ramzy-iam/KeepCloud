import { Navigate, Outlet } from 'react-router';
import {
  AuthHelper,
  authState,
  useGetProfile,
  ModeToggle,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  ROUTE_PATH,
} from '@keepcloud/web-core/react';
import { useAtomValue } from 'jotai';
import { UserProfileDto } from '@keepcloud/commons/dtos';
import { AppSidebar, UserProfileIcon } from '../../components';
import { Search } from 'lucide-react';

const LocalSidebarTrigger = () => {
  const { open, openMobile, isMobile } = useSidebar();

  if ((open && !isMobile) || (openMobile && isMobile)) {
    return null;
  }
  return <SidebarTrigger />;
};

const ProfileIcon = ({ user }: { user: UserProfileDto }) => {
  const { isMobile } = useSidebar();

  if (!isMobile) {
    return null;
  }
  return (
    <UserProfileIcon
      user={user}
      isIcon={true}
      avatarClassName="h-[30px] w-[30px]"
    />
  );
};

export default function MainLayout() {
  const { isLoading } = useGetProfile({
    enabled: AuthHelper.checkIfSessionValid(),
  });
  const user = useAtomValue(authState)?.user as UserProfileDto;

  if (!AuthHelper.checkIfSessionValid()) {
    AuthHelper.clearCookies();
    return <Navigate to={ROUTE_PATH.login} />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex h-full w-full flex-col border-0 border-x border-section-border">
      <div className="flex h-[72px] items-center justify-between border-b border-section-border px-2 py-5 md:px-8">
        <div className="flex items-center gap-2.5 text-14">
          <LocalSidebarTrigger />
          <Search className="text-foreground" size={16} />
          <span className="text-placeholder">What are you looking for?</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ProfileIcon user={user} />
          <ModeToggle />
        </div>
      </div>
      <div className="h-[calc(100%-72px)] max-h-[calc(100%-72px)] overflow-auto px-6 md:px-8">
        <Outlet />
      </div>
    </main>
  );
}
