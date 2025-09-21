import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectGroup,
  authAtom,
  Separator,
} from '@keepcloud/web-core/react';
import {
  FileMinViewDto,
  FilePermissionDto,
  UserProfileDto,
} from '@keepcloud/commons/dtos';
import { FilePermissionRole } from '@prisma/client';

import { useGetUsers } from '@keepcloud/web-core/react';
import { OwnerIcon } from '../../ui/owner-icon';
import { ClipboardInput } from '../../ui/clipboard-input';
import { useAtomValue } from 'jotai';

interface SharePeopleTabProps {
  item: FileMinViewDto;
}

const ROLE_LABELS = {
  [FilePermissionRole.OWNER]: 'Owner',
  [FilePermissionRole.EDITOR]: 'Editor',
  [FilePermissionRole.VIEWER]: 'Viewer',
};

// Public access constants
const PUBLIC_ACCESS_TYPE = {
  LIMITED: 'limited',
  ANYONE: 'anyone',
} as const;

const PUBLIC_ACCESS_ROLE = {
  VIEW: 'view',
  EDIT: 'edit',
} as const;

type PublicAccessType =
  (typeof PUBLIC_ACCESS_TYPE)[keyof typeof PUBLIC_ACCESS_TYPE];
type PublicAccessRole =
  (typeof PUBLIC_ACCESS_ROLE)[keyof typeof PUBLIC_ACCESS_ROLE];

export function SharePeopleTab({ item }: SharePeopleTabProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<FilePermissionRole>(
    FilePermissionRole.VIEWER,
  );
  const [publicAccessType, setPublicAccessType] = useState<PublicAccessType>(
    PUBLIC_ACCESS_TYPE.LIMITED,
  );
  const [publicAccessRole, setPublicAccessRole] = useState<PublicAccessRole>(
    PUBLIC_ACCESS_ROLE.VIEW,
  );

  const currentUser = useAtomValue(authAtom)?.user as UserProfileDto;

  const isLoadingPermissions = false;
  const refetchPermissions = () => console.log('Refetch permissions called');

  // Get users from API - load initial users for the dropdown
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetUsers({
    filters: { pageSize: 10, page: 1 }, // Load first 10 users for selection
    staleTime: 30 * 1000, // Cache results for 30 seconds
  });

  const apiUsers = usersResponse?.items || [];

  const handleValuesChange = (userIds: string[]) => {
    setSelectedUserIds(userIds);
  };

  const handleShare = async () => {
    if (selectedUserIds.length === 0) return;

    try {
      console.log('Sharing file with users:', {
        fileId: item.id,
        userIds: selectedUserIds,
        role: selectedRole,
      });

      setSelectedUserIds([]);
      setSelectedRole(FilePermissionRole.VIEWER);
      refetchPermissions();
    } catch (error) {
      console.error('Failed to share file:', error);
    }
  };

  // Mock handlers for now
  const handleRoleChange = async (
    permissionId: string,
    newRole: FilePermissionRole,
  ) => {
    console.log('Update permission called:', { permissionId, newRole });
  };

  const handleRemoveAccess = async (permissionId: string) => {
    console.log('Remove access called:', { permissionId });
  };
  console.log('Rendering SharePeopleTab with item:', item);
  return (
    <div className="space-y-4">
      {/* Share with new people */}
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <div className="relative flex-1">
            <MultiSelect
              values={selectedUserIds}
              onValuesChange={handleValuesChange}
            >
              <MultiSelectTrigger className="w-full">
                <MultiSelectValue
                  placeholder="Add people by name or email"
                  clickToRemove={true}
                  overflowBehavior="wrap-when-open"
                />
              </MultiSelectTrigger>
              <MultiSelectContent
                search={{
                  placeholder: 'Search people...',
                  emptyMessage: 'No users found.',
                }}
              >
                <MultiSelectGroup>
                  {isLoadingUsers ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading users...
                    </div>
                  ) : (
                    apiUsers.map((user: UserProfileDto) => (
                      <MultiSelectItem
                        key={user.id}
                        value={user.id}
                        badgeLabel={
                          <span>
                            {user.firstName} {user.lastName}
                          </span>
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className="[&>div]:h-8 [&>div]:w-8">
                            <OwnerIcon
                              user={user}
                              withName={false}
                              withTooltip={false}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </MultiSelectItem>
                    ))
                  )}
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>
          </div>
        </div>
      </div>
      <ClipboardInput
        value={
          'https://keepcloud.com/folders/0B8MXxVL7sSStfjlBVnhQUk92SGVpSGl3WmFCQVMySE5EbGllOE9BU2hZeFk3SFhaQV9XWWc?resourcekey=0-UX80l5-84OSFv0QHOw4ejw&usp=sharing'
        }
        placeholder="Share link will appear here"
        onCopy={(link) => console.log('Copied link:', link)}
      />

      {/* Current permissions */}
      <div className="space-y-2">
        <h3 className="text-12 dark:text-neutral-300">Who has access</h3>
        {isLoadingPermissions ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="mb-1 h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Owner */}
            <div className="flex items-center justify-between gap-12">
              <div className="flex items-center gap-3">
                <OwnerIcon
                  user={item.owner}
                  withName={false}
                  withTooltip={false}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {item.owner.firstName} {item.owner.lastName}{' '}
                      {currentUser.id === item.owner.id && '(You)'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.owner.email}
                  </p>
                </div>
              </div>
              <span className="text-12">owner</span>
            </div>

            {/* Shared users */}
            {item.permissions?.map((permission: FilePermissionDto) => {
              return (
                <div
                  key={permission.id}
                  className="flex items-center justify-between gap-12"
                >
                  <div className="flex items-center gap-3">
                    <OwnerIcon
                      user={permission.user}
                      withName={false}
                      withTooltip={false}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {permission.user.firstName} {permission.user.lastName}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {permission.user.email}
                      </p>
                    </div>
                  </div>
                  <Select
                    value={permission.role}
                    onValueChange={(value) => {
                      if (value === 'REVOKE') {
                        handleRemoveAccess(permission.id);
                      } else {
                        handleRoleChange(
                          permission.id,
                          value as FilePermissionRole,
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="w-32 border-0! bg-transparent! text-12 dark:hover:bg-input/50!">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <span className="text-12">
                            {ROLE_LABELS[permission.role]}
                          </span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={FilePermissionRole.VIEWER}>
                        Viewer
                      </SelectItem>
                      <SelectItem value={FilePermissionRole.EDITOR}>
                        Editor
                      </SelectItem>
                      <Separator />
                      <SelectItem value="REVOKE">Revoke access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-12 dark:text-neutral-300">Public access</h3>
          <div>
            {publicAccessType === PUBLIC_ACCESS_TYPE.ANYONE && (
              <Select
                value={publicAccessRole}
                onValueChange={(value: PublicAccessRole) => {
                  setPublicAccessRole(value);
                  console.log('Update public access role:', value);
                  // TODO: Implement public access role update
                }}
              >
                <SelectTrigger
                  className="h-min! w-min! border-0 bg-transparent! p-0 text-12! text-heading hover:bg-none!"
                  chevronClassName="opacity-100 text-heading"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PUBLIC_ACCESS_ROLE.VIEW}>
                    <div className="flex items-center gap-2">View</div>
                  </SelectItem>
                  <SelectItem value={PUBLIC_ACCESS_ROLE.EDIT}>
                    <div className="flex items-center gap-2">Edit</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <div className="w-full">
          <Select
            value={publicAccessType}
            onValueChange={(value: PublicAccessType) => {
              setPublicAccessType(value);
              if (value === PUBLIC_ACCESS_TYPE.LIMITED) {
                // Reset to view when switching back to limited
                setPublicAccessRole(PUBLIC_ACCESS_ROLE.VIEW);
              }
              console.log('Update public access type:', value);
              // TODO: Implement public access update
            }}
          >
            <SelectTrigger className="h-[52px]! w-full px-4 py-3">
              <div className="flex items-center gap-2">
                <svg
                  width="18"
                  height="19"
                  viewBox="0 0 18 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 2C11.25 3.5 11.9421 6.71902 12 9.5C11.9421 12.281 11.25 15.5 9 17M9 2C6.75 3.5 6.05794 6.71903 6 9.5C6.05794 12.281 6.75 15.5 9 17M9 2C4.85786 2 1.5 5.35786 1.5 9.5M9 2C13.1421 2 16.5 5.35786 16.5 9.5M9 17C13.1421 17 16.5 13.6421 16.5 9.5M9 17C4.85787 17 1.5 13.6421 1.5 9.5M16.5 9.5C15 11.75 11.781 12.4421 9 12.5C6.21903 12.4421 3 11.75 1.5 9.5M16.5 9.5C15 7.25 11.781 6.55794 9 6.5C6.21903 6.55794 3 7.25 1.5 9.5"
                    stroke="#2CAC68"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PUBLIC_ACCESS_TYPE.LIMITED}>
                <div className="flex flex-col items-start gap-0.5 text-12">
                  <span className="text-heading">Limited</span>
                  <span className="text-xs text-muted-foreground">
                    Only specific people can access
                  </span>
                </div>
              </SelectItem>
              <SelectItem value={PUBLIC_ACCESS_TYPE.ANYONE}>
                <div className="flex flex-col items-start gap-0.5 text-12">
                  <span className="text-heading">Anyone who has the link</span>
                  <span className="text-xs text-muted-foreground">
                    Anyone with the link can {publicAccessRole}
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
