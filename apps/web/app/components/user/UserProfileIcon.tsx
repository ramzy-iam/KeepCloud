import { ChevronsUpDown } from 'lucide-react';
import { UserProfileDto } from '@keepcloud/commons/dtos';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  cn,
  useLogout,
} from '@keepcloud/web-core/react';
import { NameFormatterHelper } from '@keepcloud/commons/helpers';

interface Props {
  className?: string;
  user: UserProfileDto;
}

export const UserProfileIcon = ({ user, className }: Props) => {
  const { logout } = useLogout();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={'text'}
          className={cn(
            'flex h-[42px] gap-3 py-6 px-6 items-center cursor-pointer hover:bg-neutral-50/25  dark:hover:bg-neutral-700',
            className
          )}
        >
          <img
            src={user.picture as string}
            alt="profile"
            width={38}
            height={38}
            className="rounded-full"
          />
          <div className="flex flex-col items-start">
            <span className="text-16-medium text-neutral-500 dark:text-white-light">
              {NameFormatterHelper.format(
                [user.firstName, user.lastName],
                'short'
              )}
            </span>
            <span className="text-12 text-foreground ">{user.email}</span>
          </div>
          <ChevronsUpDown className="opacity-50" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => logout()}
          className="cursor-pointer hover:bg-neutral-50/25!  dark:hover:bg-neutral-700!"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
