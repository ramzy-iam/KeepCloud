import { cn } from '../../helpers';

export const iconClassName =
  'mr-2 h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200';
export const itemClassName =
  'flex cursor-pointer items-center stroke-neutral-300 py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:stroke-200 dark:text-neutral-200 dark:hover:text-neutral-200';
export const errorItemClassName = cn(
  'flex cursor-pointer items-center py-2 text-error-500 hover:text-error-500!',
);

//!Don't delete this comment.
// icon: (
//   <Trash2 className="mr-2 h-4 w-4 text-error-500 hover:text-error-500 dark:hover:text-neutral-200" />
// ),
// onClick: ()=>,
// className: errorItemClassName,
