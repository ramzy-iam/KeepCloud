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
import { AppSidebar, GlobalSearch, UserProfileIcon } from '../../components';

import { PlusIcon, UploadIcon } from 'lucide-react';

const actions = [
  {
    icon: PlusIcon,
    label: 'New',
  },
  {
    icon: UploadIcon,
    label: 'Upload or drop',
  },
];

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

const ActionsButtons = () => {
  return (
    <div className="flex flex-wrap justify-start gap-4 bg-background py-6">
      {actions.map((action) => (
        <button
          key={action.label}
          className="group flex w-[100px] cursor-pointer flex-col items-center gap-2 rounded-[8px] border border-stroke-500 p-3 text-heading hover:border-primary hover:bg-primary/5 md:w-[156px] md:items-start dark:border-neutral-600 dark:hover:border-primary"
        >
          <action.icon className="text-primary dark:group-hover:text-white-light" />
          <span className="text-14 group-hover:text-primary dark:group-hover:text-white-light">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default function Layout() {
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
          <div className="h-[calc(100%-72px)] max-h-[calc(100%-72px)] overflow-auto px-6 md:px-8">
            <ActionsButtons />
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
