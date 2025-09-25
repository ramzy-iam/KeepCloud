import {
  Button,
  ROUTE_PATH,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarTrigger,
  cn,
  useSidebar,
  useGetUserStorage,
} from '@keepcloud/web-core/react';
import { UserProfileIcon } from '../../user';
import { UserProfileDto } from '@keepcloud/commons/dtos';
import { HomeMenu } from './menus/home';
import { NavLink, useLocation } from 'react-router';
import {
  SidebarHomeIcon,
  SidebarFolderIcon,
  SidebarOverviewIcon,
} from './icons';
import { RootTree } from './menus/file-tree';
import { StorageDetailsModal, StorageWidget } from '../../storage';
import { useState } from 'react';

const SidebarItems = [
  {
    label: 'Home',
    icon: <SidebarHomeIcon />,
    url: ROUTE_PATH.home,
  },
  {
    label: 'Folder',
    icon: <SidebarFolderIcon />,
    url: ROUTE_PATH.folder,
  },
];

const contents = [<HomeMenu />, <RootTree />];

interface AppSidebarProps {
  user: UserProfileDto;
}

export function AppSidebar({ user }: Readonly<AppSidebarProps>) {
  const location = useLocation();
  const activeTabIndex = SidebarItems.findIndex((item) =>
    location.pathname.startsWith(item.url),
  );
  const activeContent = contents[activeTabIndex] ?? null;
  const { open, openMobile } = useSidebar();
  const [showStorageDetails, setShowStorageDetails] = useState(false);

  // Fetch user storage data
  const {
    data: storageData,
    isLoading: storageLoading,
    error: storageError,
    refetch: refetchStorage,
  } = useGetUserStorage();

  // Default storage values if data is not loaded
  const storage = storageData ?? {
    usedStorage: 0,
    totalStorage: 107374182400, // 100GB in bytes
    usagePercentage: 0,
    planName: 'Free',
  };

  const handleUpgrade = () => {
    // TODO: Implement upgrade logic or navigation to upgrade page
    console.log('Upgrade plan clicked');
  };

  const handleSeeDetails = () => {
    setShowStorageDetails(true);
  };

  return (
    <>
      <Sidebar className="border-0 border-r-1 border-section-border">
        <SidebarContent className="h-full overflow-hidden p-0">
          <SidebarGroup className="h-full px-0 py-0">
            <SidebarGroupContent className="flex h-full">
              <div className="flex h-full w-[88px] flex-col items-center justify-between p-6 text-foreground">
                <div className="flex h-full flex-col items-center gap-y-6">
                  <NavLink to={'/'}>
                    <img
                      src="/assets/svg/logomark.svg"
                      alt="logo"
                      width={40}
                      height={40}
                    />
                  </NavLink>
                  <div className="relative flex flex-col items-center justify-between gap-6">
                    {SidebarItems.map((item) => (
                      <NavLink
                        key={item.label}
                        to={item.url}
                        className="flex size-10 cursor-pointer flex-col items-center gap-1"
                      >
                        {({ isActive }) => (
                          <Button
                            className={cn(
                              'group flex size-10 cursor-pointer flex-col items-center gap-1 stroke-foreground hover:stroke-primary hover:text-primary dark:hover:stroke-white-light dark:hover:text-white-light',
                              isActive &&
                                'stroke-primary text-primary dark:stroke-white-light dark:text-white-light',
                            )}
                            variant="text"
                          >
                            {item.icon}
                            <span className="text-12-medium">{item.label}</span>
                            {isActive && (
                              <div className="absolute -right-[21px] z-[2] h-10 border-[1.5px] border-primary"></div>
                            )}
                          </Button>
                        )}
                      </NavLink>
                    ))}
                  </div>
                  <div className="grid size-12 cursor-pointer place-items-center gap-1 rounded-[8px] stroke-foreground p-2 hover:bg-stroke-200 hover:text-neutral-300 dark:hover:bg-white/5 dark:hover:stroke-neutral-300">
                    <SidebarOverviewIcon />
                    <span className="text-12-medium">More</span>
                  </div>
                </div>
              </div>

              <div className="relative flex h-full w-[267px] flex-col items-start gap-8 border-0 border-x border-section-border pt-6">
                <div className="flex w-full items-center justify-between">
                  <UserProfileIcon user={user} className="px-6" />
                  {openMobile && <SidebarTrigger className="mr-2" />}
                </div>
                <div className="flex h-full flex-col justify-between overflow-auto">
                  <div className="px-6">{activeContent}</div>
                  <StorageWidget
                    usedStorage={storage.usedStorage}
                    totalStorage={storage.totalStorage}
                    onUpgrade={handleUpgrade}
                    onSeeDetails={handleSeeDetails}
                    isLoading={storageLoading}
                    error={!!storageError}
                    onRetry={() => refetchStorage()}
                    className="mx-6 mb-6"
                  />
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <StorageDetailsModal
        isOpen={showStorageDetails}
        onClose={() => setShowStorageDetails(false)}
        usedStorage={storage.usedStorage}
        totalStorage={storage.totalStorage}
      />
    </>
  );
}
