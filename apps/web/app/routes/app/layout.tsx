import { Outlet } from 'react-router';
import { ModeToggle } from '../../components';

export default function Layout() {
  return (
    <div className=" h-svh  flex ">
      <div className=" w-[88px] h-full  p-6 flex flex-col items-center gap-y-6 border-0 border-r-1 border-section-border">
        <img src="/assets/svg/logomark.svg" alt="logo" width={40} height={40} />
        <div className="te">home</div>
      </div>
      <div className="w-[267px] p-6 h-full border-0 border-x border-section-border ">
        profile
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
            <span>What are you looking for?</span>
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
