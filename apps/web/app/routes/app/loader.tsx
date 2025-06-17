import { Logo } from '../../components';

export default function FullScreenLoader() {
  return (
    <div className="relative flex h-svh w-full flex-col items-center justify-center">
      <div className="absolute top-0 left-0 h-[3px] w-full overflow-hidden bg-sidebar-accent">
        <div className="h-full w-1/3 animate-[indefinite-slide_1.2s_linear_infinite] bg-[#4C3CC6]" />
      </div>

      <div className="flex">
        <Logo />
      </div>
    </div>
  );
}
