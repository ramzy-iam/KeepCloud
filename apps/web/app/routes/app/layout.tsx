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
      height="20"
      viewBox="0 0 20 20"
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
      height="20"
      viewBox="0 0 20 20"
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
      width="13"
      height="13"
      viewBox="0 0 13 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.00004 2.49967C8.46028 2.49967 8.83337 2.12658 8.83337 1.66634C8.83337 1.2061 8.46028 0.833008 8.00004 0.833008C7.5398 0.833008 7.16671 1.2061 7.16671 1.66634C7.16671 2.12658 7.5398 2.49967 8.00004 2.49967Z"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8.00004 8.33301C8.46028 8.33301 8.83337 7.95991 8.83337 7.49967C8.83337 7.03944 8.46028 6.66634 8.00004 6.66634C7.5398 6.66634 7.16671 7.03944 7.16671 7.49967C7.16671 7.95991 7.5398 8.33301 8.00004 8.33301Z"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M8.00004 14.1663C8.46028 14.1663 8.83337 13.7932 8.83337 13.333C8.83337 12.8728 8.46028 12.4997 8.00004 12.4997C7.5398 12.4997 7.16671 12.8728 7.16671 13.333C7.16671 13.7932 7.5398 14.1663 8.00004 14.1663Z"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M13.8334 2.49967C14.2936 2.49967 14.6667 2.12658 14.6667 1.66634C14.6667 1.2061 14.2936 0.833008 13.8334 0.833008C13.3731 0.833008 13 1.2061 13 1.66634C13 2.12658 13.3731 2.49967 13.8334 2.49967Z"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M13.8334 8.33301C14.2936 8.33301 14.6667 7.95991 14.6667 7.49967C14.6667 7.03944 14.2936 6.66634 13.8334 6.66634C13.3731 6.66634 13 7.03944 13 7.49967C13 7.95991 13.3731 8.33301 13.8334 8.33301Z"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M13.8334 14.1663C14.2936 14.1663 14.6667 13.7932 14.6667 13.333C14.6667 12.8728 14.2936 12.4997 13.8334 12.4997C13.3731 12.4997 13 12.8728 13 13.333C13 13.7932 13.3731 14.1663 13.8334 14.1663Z"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M2.16671 2.49967C2.62694 2.49967 3.00004 2.12658 3.00004 1.66634C3.00004 1.2061 2.62694 0.833008 2.16671 0.833008C1.70647 0.833008 1.33337 1.2061 1.33337 1.66634C1.33337 2.12658 1.70647 2.49967 2.16671 2.49967Z"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M2.16671 8.33301C2.62694 8.33301 3.00004 7.95991 3.00004 7.49967C3.00004 7.03944 2.62694 6.66634 2.16671 6.66634C1.70647 6.66634 1.33337 7.03944 1.33337 7.49967C1.33337 7.95991 1.70647 8.33301 2.16671 8.33301Z"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M2.16671 14.1663C2.62694 14.1663 3.00004 13.7932 3.00004 13.333C3.00004 12.8728 2.62694 12.4997 2.16671 12.4997C1.70647 12.4997 1.33337 12.8728 1.33337 13.333C1.33337 13.7932 1.70647 14.1663 2.16671 14.1663Z"
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
        <div className=" flex  flex-col items-center justify-between  gap-6">
          {SidebarItems.map((item) => (
            <div
              key={item.label}
              className="group size-10 flex   flex-col items-center gap-1 cursor-pointer stroke-foreground hover:text-primary  hover:stroke-primary  dark:hover:stroke-white-light dark:hover:text-white-light"
            >
              {item.icon}
              <span className="text-12-medium">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="grid size-12 place-items-center rounded-[8px] gap-1 p-2 stroke-foreground hover:text-neutral-300 cursor-pointer hover:bg-stroke-200 dark:hover:bg-white/5 dark:hover:stroke-neutral-300">
          <OverviewIcon />
          <span className="text-12-medium">More</span>
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
