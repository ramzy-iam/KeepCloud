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
import { Zap } from 'lucide-react';

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

  return (
    <Sidebar className="border-0 border-r-1 border-section-border">
      <SidebarContent className="h-full overflow-hidden">
        <SidebarGroup className="h-full py-0">
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
              {(open || openMobile) && <SidebarTrigger />}
            </div>

            <div className="relative flex h-full w-[267px] flex-col gap-8 border-0 border-x border-section-border bg-red-600 p-6">
              <UserProfileIcon user={user} />
              <div className="flex h-full flex-col justify-between overflow-auto">
                {activeContent}
                <div className="flex h-[140px] w-[219px] flex-col gap-3 border-2 border-primary p-4">
                  <div className="flex items-center justify-between text-14-semibold">
                    <span>Available Storage</span>
                    <span>50%</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-[8px] rounded-[20px] bg-white">
                      <div
                        className="h-full rounded-[20px] bg-primary"
                        style={{ width: '50%' }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-12-semibold">
                      <span>
                        50GB used <span>of 100GB</span>
                      </span>
                      <span>See details</span>
                    </div>
                  </div>
                  <Button variant="primary">
                    <span className="flex items-center gap-2">
                      <svg
                        width="17"
                        height="16"
                        viewBox="0 0 17 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.16723 1.33301L3.22953 8.45824C2.99699 8.73729 2.88072 8.87681 2.87894 8.99465C2.8774 9.09709 2.92305 9.19454 3.00273 9.25894C3.09439 9.33301 3.27601 9.33301 3.63925 9.33301H8.50056L7.83389 14.6663L13.7716 7.54111C14.0041 7.26206 14.1204 7.12254 14.1222 7.0047C14.1237 6.90226 14.0781 6.8048 13.9984 6.74041C13.9067 6.66634 13.7251 6.66634 13.3619 6.66634H8.50056L9.16723 1.33301Z"
                          fill="white"
                          stroke="white"
                          stroke-width="0.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>

                      <span className="text-14-medium">Upgrade</span>
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
