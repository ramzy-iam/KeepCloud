import { UserProfileDto } from '@keepcloud/commons/dtos';
import { NameFormatterHelper } from '@keepcloud/commons/helpers';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  authAtom,
  cn,
} from '@keepcloud/web-core/react';
import { useAtomValue } from 'jotai';
import { title } from 'radash';

interface OwnerIconProps {
  user: UserProfileDto;
}

export const OwnerIcon = ({ user }: OwnerIconProps) => {
  const currentUser = useAtomValue(authAtom)?.user as UserProfileDto;
  const ownerIsCurrentUser = user.id === currentUser.id;
  const name = ownerIsCurrentUser
    ? 'me'
    : title(`${user.firstName} ${user.lastName}`);
  title;
  return (
    <div className="flex items-center gap-2">
      <Avatar className={cn('h-[24px] w-[24px]')}>
        <AvatarImage src={user.picture as string} />
        <AvatarFallback>
          {NameFormatterHelper.format(
            [user.firstName, user.lastName],
            'initials',
          )}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-14-medium text-secondary-foreground">
        {name}
      </span>
    </div>
  );
};
