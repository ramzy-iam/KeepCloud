import {
  Button,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarTrigger,
  cn,
  useSidebar,
} from '@keepcloud/web-core/react';
import { useState } from 'react';
import { UserProfileIcon } from '../../user';
import { UserProfileDto } from '@keepcloud/commons/dtos';
import { HomeMenu } from './menus/home';
import { FileTree } from './menus/folder';

const HomeIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.66667 14.6663H13.3333M9.18141 2.80297L3.52949 7.1989C3.15168 7.49275 2.96278 7.63968 2.82669 7.82368C2.70614 7.98667 2.61633 8.17029 2.56169 8.36551C2.5 8.5859 2.5 8.82521 2.5 9.30384V15.333C2.5 16.2664 2.5 16.7331 2.68166 17.0896C2.84144 17.4032 3.09641 17.6582 3.41002 17.818C3.76654 17.9996 4.23325 17.9996 5.16667 17.9996H14.8333C15.7668 17.9996 16.2335 17.9996 16.59 17.818C16.9036 17.6582 17.1586 17.4032 17.3183 17.0896C17.5 16.7331 17.5 16.2664 17.5 15.333V9.30384C17.5 8.82521 17.5 8.5859 17.4383 8.36551C17.3837 8.17029 17.2939 7.98667 17.1733 7.82368C17.0372 7.63968 16.8483 7.49275 16.4705 7.19891L10.8186 2.80297C10.5258 2.57526 10.3794 2.4614 10.2178 2.41763C10.0752 2.37902 9.92484 2.37902 9.78221 2.41763C9.62057 2.4614 9.47418 2.57526 9.18141 2.80297Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const FolderIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.16667 3.83301H7.5L10 6.33301H15.8333C16.2754 6.33301 16.6993 6.5086 17.0118 6.82116C17.3244 7.13372 17.5 7.55765 17.5 7.99967V14.6663C17.5 15.1084 17.3244 15.5323 17.0118 15.8449C16.6993 16.1574 16.2754 16.333 15.8333 16.333H4.16667C3.72464 16.333 3.30072 16.1574 2.98816 15.8449C2.67559 15.5323 2.5 15.1084 2.5 14.6663V5.49967C2.5 5.05765 2.67559 4.63372 2.98816 4.32116C3.30072 4.0086 3.72464 3.83301 4.16667 3.83301Z"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const OverviewIcon = () => {
  return (
    <svg
      width="16"
      height="15"
      viewBox="0 0 16 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.00004 2.50004C8.46028 2.50004 8.83337 2.12694 8.83337 1.66671C8.83337 1.20647 8.46028 0.833374 8.00004 0.833374C7.5398 0.833374 7.16671 1.20647 7.16671 1.66671C7.16671 2.12694 7.5398 2.50004 8.00004 2.50004Z"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.00004 8.33337C8.46028 8.33337 8.83337 7.96028 8.83337 7.50004C8.83337 7.0398 8.46028 6.66671 8.00004 6.66671C7.5398 6.66671 7.16671 7.0398 7.16671 7.50004C7.16671 7.96028 7.5398 8.33337 8.00004 8.33337Z"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.00004 14.1667C8.46028 14.1667 8.83337 13.7936 8.83337 13.3334C8.83337 12.8731 8.46028 12.5 8.00004 12.5C7.5398 12.5 7.16671 12.8731 7.16671 13.3334C7.16671 13.7936 7.5398 14.1667 8.00004 14.1667Z"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.8334 2.50004C14.2936 2.50004 14.6667 2.12694 14.6667 1.66671C14.6667 1.20647 14.2936 0.833374 13.8334 0.833374C13.3731 0.833374 13 1.20647 13 1.66671C13 2.12694 13.3731 2.50004 13.8334 2.50004Z"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.8334 8.33337C14.2936 8.33337 14.6667 7.96028 14.6667 7.50004C14.6667 7.0398 14.2936 6.66671 13.8334 6.66671C13.3731 6.66671 13 7.0398 13 7.50004C13 7.96028 13.3731 8.33337 13.8334 8.33337Z"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.8334 14.1667C14.2936 14.1667 14.6667 13.7936 14.6667 13.3334C14.6667 12.8731 14.2936 12.5 13.8334 12.5C13.3731 12.5 13 12.8731 13 13.3334C13 13.7936 13.3731 14.1667 13.8334 14.1667Z"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.16671 2.50004C2.62694 2.50004 3.00004 2.12694 3.00004 1.66671C3.00004 1.20647 2.62694 0.833374 2.16671 0.833374C1.70647 0.833374 1.33337 1.20647 1.33337 1.66671C1.33337 2.12694 1.70647 2.50004 2.16671 2.50004Z"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.16671 8.33337C2.62694 8.33337 3.00004 7.96028 3.00004 7.50004C3.00004 7.0398 2.62694 6.66671 2.16671 6.66671C1.70647 6.66671 1.33337 7.0398 1.33337 7.50004C1.33337 7.96028 1.70647 8.33337 2.16671 8.33337Z"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.16671 14.1667C2.62694 14.1667 3.00004 13.7936 3.00004 13.3334C3.00004 12.8731 2.62694 12.5 2.16671 12.5C1.70647 12.5 1.33337 12.8731 1.33337 13.3334C1.33337 13.7936 1.70647 14.1667 2.16671 14.1667Z"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const SidebarItems = [
  {
    label: 'Home',
    icon: <HomeIcon />,
  },
  {
    label: 'Folder',
    icon: <FolderIcon />,
  },
];

const contents = [<HomeMenu />, <FileTree />];

interface Props {
  user: UserProfileDto;
}

export function AppSidebar({ user }: Readonly<Props>) {
  const [selectedTab, setSelectedTab] = useState(0);
  const { open, openMobile } = useSidebar();

  return (
    <Sidebar className="border-0 border-r-1 border-section-border">
      <SidebarContent className="h-full overflow-hidden">
        <SidebarGroup className="h-full py-0">
          <SidebarGroupContent className="flex h-full">
            <div className="flex h-full w-[88px] flex-col items-center justify-between p-6 text-foreground">
              <div className="flex h-full flex-col items-center gap-y-6">
                <img
                  src="/assets/svg/logomark.svg"
                  alt="logo"
                  width={40}
                  height={40}
                />
                <div className="flex flex-col items-center justify-between gap-6">
                  {SidebarItems.map((item, index) => (
                    <Button
                      className={cn(
                        'group relative flex size-10 cursor-pointer flex-col items-center gap-1 stroke-foreground hover:stroke-primary hover:text-primary dark:hover:stroke-white-light dark:hover:text-white-light',
                        selectedTab === index &&
                          'stroke-primary text-primary dark:stroke-white-light dark:text-white-light',
                      )}
                      variant="text"
                      key={item.label}
                      onClick={() => setSelectedTab(index)}
                    >
                      {item.icon}
                      <span className="text-12-medium">{item.label}</span>
                      {selectedTab === index && (
                        <div className="absolute -right-[21px] z-[2] h-10 border-[1.5px] border-primary"></div>
                      )}
                    </Button>
                  ))}
                </div>
                <div className="grid size-12 cursor-pointer place-items-center gap-1 rounded-[8px] stroke-foreground p-2 hover:bg-stroke-200 hover:text-neutral-300 dark:hover:bg-white/5 dark:hover:stroke-neutral-300">
                  <OverviewIcon />
                  <span className="text-12-medium">More</span>
                </div>
              </div>
              {(open || openMobile) && <SidebarTrigger />}
            </div>

            <div className="relative flex h-full w-[267px] flex-col gap-8 border-0 border-x border-section-border p-6">
              <UserProfileIcon user={user} />
              <div className="h-full overflow-auto">
                {contents[selectedTab]}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
