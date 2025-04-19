import { Navigate, Outlet } from 'react-router';
import {
  AuthHelper,
  authState,
  useGetProfile,
  ModeToggle,
} from '@keepcloud/web-core/react';
import { useAtomValue } from 'jotai';
import { UserProfileDto } from '@keepcloud/commons/dtos';
import { UserProfileIcon } from '../../components';
import { Search } from 'lucide-react';

const HomeIcon = () => {
  return (
    <svg
      width="20"
      height="21"
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.66667 14.6663H13.3333M9.18141 2.80297L3.52949 7.1989C3.15168 7.49275 2.96278 7.63968 2.82669 7.82368C2.70614 7.98667 2.61633 8.17029 2.56169 8.36551C2.5 8.5859 2.5 8.82521 2.5 9.30384V15.333C2.5 16.2664 2.5 16.7331 2.68166 17.0896C2.84144 17.4032 3.09641 17.6582 3.41002 17.818C3.76654 17.9996 4.23325 17.9996 5.16667 17.9996H14.8333C15.7668 17.9996 16.2335 17.9996 16.59 17.818C16.9036 17.6582 17.1586 17.4032 17.3183 17.0896C17.5 16.7331 17.5 16.2664 17.5 15.333V9.30384C17.5 8.82521 17.5 8.5859 17.4383 8.36551C17.3837 8.17029 17.2939 7.98667 17.1733 7.82368C17.0372 7.63968 16.8483 7.49275 16.4705 7.19891L10.8186 2.80297C10.5258 2.57526 10.3794 2.4614 10.2178 2.41763C10.0752 2.37902 9.92484 2.37902 9.78221 2.41763C9.62057 2.4614 9.47418 2.57526 9.18141 2.80297Z"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

const FolderIcon = () => {
  return (
    <svg
      width="20"
      height="21"
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.16667 3.83301H7.5L10 6.33301H15.8333C16.2754 6.33301 16.6993 6.5086 17.0118 6.82116C17.3244 7.13372 17.5 7.55765 17.5 7.99967V14.6663C17.5 15.1084 17.3244 15.5323 17.0118 15.8449C16.6993 16.1574 16.2754 16.333 15.8333 16.333H4.16667C3.72464 16.333 3.30072 16.1574 2.98816 15.8449C2.67559 15.5323 2.5 15.1084 2.5 14.6663V5.49967C2.5 5.05765 2.67559 4.63372 2.98816 4.32116C3.30072 4.0086 3.72464 3.83301 4.16667 3.83301Z"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

const OverviewIcon = () => {
  return (
    <svg
      width="20"
      height="21"
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 5.49967C10.4602 5.49967 10.8333 5.12658 10.8333 4.66634C10.8333 4.2061 10.4602 3.83301 10 3.83301C9.53976 3.83301 9.16667 4.2061 9.16667 4.66634C9.16667 5.12658 9.53976 5.49967 10 5.49967Z"
        stroke="#737379"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M10 11.333C10.4602 11.333 10.8333 10.9599 10.8333 10.4997C10.8333 10.0394 10.4602 9.66634 10 9.66634C9.53976 9.66634 9.16667 10.0394 9.16667 10.4997C9.16667 10.9599 9.53976 11.333 10 11.333Z"
        stroke="#737379"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M10 17.1663C10.4602 17.1663 10.8333 16.7932 10.8333 16.333C10.8333 15.8728 10.4602 15.4997 10 15.4997C9.53976 15.4997 9.16667 15.8728 9.16667 16.333C9.16667 16.7932 9.53976 17.1663 10 17.1663Z"
        stroke="#737379"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M15.8333 5.49967C16.2936 5.49967 16.6667 5.12658 16.6667 4.66634C16.6667 4.2061 16.2936 3.83301 15.8333 3.83301C15.3731 3.83301 15 4.2061 15 4.66634C15 5.12658 15.3731 5.49967 15.8333 5.49967Z"
        stroke="#737379"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M15.8333 11.333C16.2936 11.333 16.6667 10.9599 16.6667 10.4997C16.6667 10.0394 16.2936 9.66634 15.8333 9.66634C15.3731 9.66634 15 10.0394 15 10.4997C15 10.9599 15.3731 11.333 15.8333 11.333Z"
        stroke="#737379"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M15.8333 17.1663C16.2936 17.1663 16.6667 16.7932 16.6667 16.333C16.6667 15.8728 16.2936 15.4997 15.8333 15.4997C15.3731 15.4997 15 15.8728 15 16.333C15 16.7932 15.3731 17.1663 15.8333 17.1663Z"
        stroke="#737379"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M4.16667 5.49967C4.6269 5.49967 5 5.12658 5 4.66634C5 4.2061 4.6269 3.83301 4.16667 3.83301C3.70643 3.83301 3.33333 4.2061 3.33333 4.66634C3.33333 5.12658 3.70643 5.49967 4.16667 5.49967Z"
        stroke="#737379"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M4.16667 11.333C4.6269 11.333 5 10.9599 5 10.4997C5 10.0394 4.6269 9.66634 4.16667 9.66634C3.70643 9.66634 3.33333 10.0394 3.33333 10.4997C3.33333 10.9599 3.70643 11.333 4.16667 11.333Z"
        stroke="#737379"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M4.16667 17.1663C4.6269 17.1663 5 16.7932 5 16.333C5 15.8728 4.6269 15.4997 4.16667 15.4997C3.70643 15.4997 3.33333 15.8728 3.33333 16.333C3.33333 16.7932 3.70643 17.1663 4.16667 17.1663Z"
        stroke="#737379"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
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

export default function Layout() {
  const { isLoading } = useGetProfile({
    enabled: AuthHelper.checkIfSessionValid(),
  });
  const user = useAtomValue(authState)?.user as UserProfileDto;

  if (!AuthHelper.checkIfSessionValid()) {
    AuthHelper.clearCookies();
    return <Navigate to="app/auth" />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className=" h-svh  flex ">
      <div className=" w-[88px] h-full  p-6 flex flex-col items-center gap-y-6 border-0 border-r-1 border-section-border">
        <img src="/assets/svg/logomark.svg" alt="logo" width={40} height={40} />
        <div className=" flex  flex-col items-center  gap-6">
          {SidebarItems.map((item) => (
            <div
              key={item.label}
              className="group flex  flex-col items-center gap-1 cursor-pointer stroke-foreground hover:text-primary  hover:stroke-primary  dark:hover:stroke-white-light dark:hover:text-white-light"
            >
              {item.icon}
              <span className="text-12-medium">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center rounded-[8px] gap-1 p-2 cursor-pointer hover:bg-stroke-200 dark:hover:bg-white/5">
          <OverviewIcon />
          <span className="text-12-medium ">More</span>
        </div>
      </div>
      <div className="w-[267px] p-6 h-full border-0 border-x border-section-border ">
        <UserProfileIcon user={user} />
      </div>
      <div className="w-[calc(100%-267px-88px)] h-full flex flex-col border-0 border-x  border-section-border ">
        <div className="h-[72px] border-b border-section-border py-5 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-14">
            <Search className="text-foreground" size={16} />
            <span className="text-placeholder">What are you looking for?</span>
          </div>
          <div>
            <ModeToggle />
          </div>
        </div>
        <div className="px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
