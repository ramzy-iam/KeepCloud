import { Env } from '@keepcloud/web-core/react';

export const Logomark = ({ className = '' }: { className?: string }) => {
  const logomarkImg = (
    <img
      src="/assets/svg/logomark.svg"
      alt="logo"
      width={40}
      height={40}
      className={className}
    />
  );

  if (Env.VITE_BETA_MODE) {
    return (
      <div className="relative inline-block">
        {logomarkImg}
        <span className="absolute -top-2.5 -right-1 rotate-12 transform rounded-full bg-orange-500 px-1 py-0.5 text-[8px] font-bold text-white shadow-lg">
          BETA
        </span>
      </div>
    );
  }

  return logomarkImg;
};
