import { Navigate, Outlet } from 'react-router';
import {
  AuthHelper,
  authState,
  useGetProfile,
  ModeToggle,
  PopoverContent,
  PopoverTrigger,
  Popover,
  Button,
  Command,
  CommandList,
  CommandGroup,
  CommandItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@keepcloud/web-core/react';
import { useAtomValue } from 'jotai';
import { UserProfileDto } from '@keepcloud/commons/dtos';
import { ChevronsUpDown } from 'lucide-react';
import { UserProfileIcon } from '../../components';
// import HomeIcon from '../../../public/assets/svg/home-icon.svg';

const HomeIcon = () => {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.16667 12.2776H11.8333M7.68141 0.414294L2.02949 4.81023C1.65168 5.10408 1.46278 5.25101 1.32669 5.43501C1.20614 5.598 1.11633 5.78161 1.06169 5.97684C1 6.19723 1 6.43654 1 6.91517V12.9443C1 13.8777 1 14.3444 1.18166 14.7009C1.34144 15.0145 1.59641 15.2695 1.91002 15.4293C2.26654 15.6109 2.73325 15.6109 3.66667 15.6109H13.3333C14.2668 15.6109 14.7335 15.6109 15.09 15.4293C15.4036 15.2695 15.6586 15.0145 15.8183 14.7009C16 14.3444 16 13.8777 16 12.9443V6.91517C16 6.43654 16 6.19723 15.9383 5.97684C15.8837 5.78161 15.7939 5.598 15.6733 5.43501C15.5372 5.25101 15.3483 5.10408 14.9705 4.81023L9.31859 0.414295C9.02582 0.186584 8.87943 0.0727282 8.71779 0.0289625C8.57516 -0.00965418 8.42484 -0.00965418 8.28221 0.0289625C8.12057 0.0727282 7.97418 0.186583 7.68141 0.414294Z"
        stroke="#737379"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

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
        <div className="text-primary">
          <HomeIcon />
        </div>
      </div>
      <div className="w-[267px] p-6 h-full border-0 border-x border-section-border ">
        <UserProfileIcon user={user} />
      </div>
      <div className="w-[calc(100%-267px-88px)] h-full flex flex-col border-0 border-x  border-section-border ">
        <div className="h-[72px] border-b border-section-border py-5 px-8 flex items-center justify-between">
          <div className="flex text-14">
            <img
              src="/assets/svg/search-icon.svg"
              alt="search"
              width={16}
              height={16}
              className="mr-2"
            />
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
