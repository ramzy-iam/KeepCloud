import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { Loader2 } from 'lucide-react';
import { cn } from '../../helpers';

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer px-[24px] py-[13px] justify-center gap-2 whitespace-nowrap shadow-[0px_4px_8px_rgba(0, 0, 0, 0.16)] rounded-[8px] border border-1 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none ",
  {
    variants: {
      variant: {
        primary:
          ' text-primary-foreground   bg-linear-to-t from-[#4C3CC6] to-[#7E60F8] border-[#5749BF]  ',
        danger:
          'border-error text-white  bg-linear-to-t from-[#B63542] to-[#E95858]  hover:bg-error/90 focus-visible:ring-error/20 dark:focus-visible:ring-error/40 dark:bg-destructive/60',
        secondary:
          'text-secondary-foreground bg-white-light border-stroke-300 hover:bg-[#f0f0f0]/20 shadow-[0_4px_8px_rgba(0, 0, 0, 0.4)] dark:bg-neutral-800 dark:border-neutral-600 ',
        text: 'border-0',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',

        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },

      size: {
        default: 'h-[32px] rounded-md gap-1.5',
        sm: 'h-[32px] rounded-md gap-1.5  has-[>svg]:px-2.5',
        md: 'h-[38px]  font-normal text-[14px] has-[>svg]:px-3',
        lg: 'h-[44px] rounded-md  has-[>svg]:px-4',
        icon: 'size-[32px] p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  loading,
  asChild = false,
  disabled,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }), 'relative')}
      disabled={disabled || loading}
      {...(asChild && {
        'data-state': loading ? 'loading' : undefined,
      })}
      {...(loading && {
        disabled: true,
        'aria-disabled': true,
      })}
      {...props}
    >
      <>
        {loading && (
          <div className="absolute flex h-full w-full items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {props.children}
      </>
    </Comp>
  );
}

export { Button, buttonVariants };
