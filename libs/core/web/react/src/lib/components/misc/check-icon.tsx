import { Check } from 'lucide-react';
import { cn } from '../../helpers';
import { Button } from '../ui';

export const CheckIcon = ({
  className = '',
  custom = false,
}: {
  className?: string;
  custom?: boolean;
}) => {
  if (custom)
    return (
      <svg
        width="25"
        height="25"
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(className)}
      >
        <rect
          x="1"
          y="1"
          width="23"
          height="23"
          rx="11.5"
          fill="url(#paint0_linear_2590_35534)"
        />
        <rect
          x="1"
          y="1"
          width="23"
          height="23"
          rx="11.5"
          stroke="url(#paint1_linear_2590_35534)"
          strokeWidth="2"
        />
        <path
          d="M12.4999 6.71295C9.31127 6.71295 6.71289 9.31133 6.71289 12.5C6.71289 15.6886 9.31127 18.287 12.4999 18.287C15.6886 18.287 18.287 15.6886 18.287 12.5C18.287 9.31133 15.6886 6.71295 12.4999 6.71295ZM15.2661 11.169L11.9849 14.4502C11.9039 14.5312 11.7939 14.5775 11.6782 14.5775C11.5624 14.5775 11.4525 14.5312 11.3715 14.4502L9.73372 12.8125C9.5659 12.6447 9.5659 12.3669 9.73372 12.1991C9.90155 12.0312 10.1793 12.0312 10.3471 12.1991L11.6782 13.5301L14.6527 10.5555C14.8205 10.3877 15.0983 10.3877 15.2661 10.5555C15.434 10.7234 15.434 10.9954 15.2661 11.169Z"
          fill="white"
        />
        <defs>
          <linearGradient
            id="paint0_linear_2590_35534"
            x1="12.5"
            y1="25"
            x2="12.5"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1B8946" />
            <stop offset="1" stopColor="#2CAC68" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_2590_35534"
            x1="12.5"
            y1="0"
            x2="12.5"
            y2="25"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0.7" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );

  return (
    <Button
      variant="outline"
      size="icon"
      className="size-[25px] rounded-full border-none bg-success text-muted-foreground group-hover:pointer-events-none group-hover:hidden"
      aria-label="Open folder"
    >
      <Check size={16} strokeWidth={3} className="text-white-light" />
    </Button>
  );
};
