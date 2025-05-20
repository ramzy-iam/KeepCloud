import { ChevronsUpDown, LogOutIcon } from 'lucide-react';
import { UserProfileDto } from '@keepcloud/commons/dtos';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Separator,
  cn,
  useLogout,
} from '@keepcloud/web-core/react';
import { NameFormatterHelper } from '@keepcloud/commons/helpers';

interface Props {
  className?: string;
  user: UserProfileDto;
  isIcon?: boolean;
  avatarClassName?: string;
}

export const UserProfileIcon = ({
  user,
  className,
  isIcon = false,
  avatarClassName = '',
}: Props) => {
  const { logout } = useLogout();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isIcon ? (
          <Avatar className={cn('h-[38px] w-[38px]', avatarClassName)}>
            <AvatarImage src={user.picture as string} />
            <AvatarFallback>
              {NameFormatterHelper.format(
                [user.firstName, user.lastName],
                'initials',
              )}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Button
            variant={'text'}
            className={cn(
              'flex h-[42px] w-[219px] cursor-pointer items-center px-2 py-6 hover:bg-neutral-50/25 dark:hover:bg-neutral-700',
              className,
            )}
          >
            <Avatar className={cn('h-[38px] w-[38px]', avatarClassName)}>
              <AvatarImage src={user.picture as string} />
              <AvatarFallback>
                {NameFormatterHelper.format(
                  [user.firstName, user.lastName],
                  'initials',
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start truncate">
              <span className="text-16-medium text-neutral-500 dark:text-white-light">
                {NameFormatterHelper.format(
                  [user.firstName, user.lastName],
                  'short',
                )}
              </span>
              <span className="w-full max-w-full truncate text-12 text-foreground">
                {user.email}
              </span>
            </div>
            <ChevronsUpDown className="text-foreground" size={16} />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div
          className={cn(
            'mb-1 flex h-[42px] w-[219px] items-center gap-2',
            className,
          )}
        >
          <img
            src={user.picture as string}
            alt="profile"
            width={38}
            height={38}
            className="rounded-full"
          />
          <div className="flex flex-col items-start truncate">
            <span className="text-12-medium text-neutral-500 dark:text-white-light">
              {NameFormatterHelper.format(
                [user.firstName, user.lastName],
                'short',
              )}
            </span>
            <span className="w-full max-w-full truncate text-12 text-foreground">
              {user.email}
            </span>
          </div>
        </div>
        <Separator />
        <DropdownMenuItem
          onClick={() => logout()}
          className="cursor-pointer hover:bg-neutral-50/25! dark:hover:bg-neutral-700!"
        >
          <LogOutIcon className="w-full truncate text-inherit" size={16} />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
