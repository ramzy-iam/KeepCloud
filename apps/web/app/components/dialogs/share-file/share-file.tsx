import { useState, useEffect } from 'react';
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
  Button,
  Textarea,
  Checkbox,
  cn,
  Env,
} from '@keepcloud/web-core/react';
import {
  FileMinViewDto,
  FilePermissionDto,
  UserProfileDto,
} from '@keepcloud/commons/dtos';
import { FilePermissionRole } from '@keepcloud/commons/types';

import {
  useGetUsers,
  useShareFile,
  useShareFilePublic,
  useUnshareFilePublic,
  useUpdatePermissionRole,
  useRevokePermission,
  useGetFilePermissions,
} from '@keepcloud/web-core/react';
import { OwnerIcon } from '../../ui/owner-icon';
import { ClipboardInput } from '../../ui/clipboard-input';
import { useAtomValue } from 'jotai';

interface SharePeopleTabProps {
  item: FileMinViewDto;
  onSelectionChange?: (hasSelection: boolean) => void;
  onClearSelection?: () => void;
  clearSelectionTrigger?: number; // Changed whenever parent wants to clear selection
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

const mapFilePermissionToPublicRole = (
  fileRole: FilePermissionRole,
): PublicAccessRole => {
  switch (fileRole) {
    case FilePermissionRole.EDITOR:
      return PUBLIC_ACCESS_ROLE.EDIT;
    case FilePermissionRole.VIEWER:
    default:
      return PUBLIC_ACCESS_ROLE.VIEW;
  }
};

const mapPublicRoleToFilePermission = (
  publicRole: PublicAccessRole,
): FilePermissionRole => {
  switch (publicRole) {
    case PUBLIC_ACCESS_ROLE.EDIT:
      return FilePermissionRole.EDITOR;
    case PUBLIC_ACCESS_ROLE.VIEW:
    default:
      return FilePermissionRole.VIEWER;
  }
};

type PublicAccessType =
  (typeof PUBLIC_ACCESS_TYPE)[keyof typeof PUBLIC_ACCESS_TYPE];
type PublicAccessRole =
  (typeof PUBLIC_ACCESS_ROLE)[keyof typeof PUBLIC_ACCESS_ROLE];

export function ShareFile({
  item,
  onSelectionChange,
  onClearSelection,
  clearSelectionTrigger,
}: SharePeopleTabProps) {
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
  const [shareMessage, setShareMessage] = useState<string | undefined>(
    undefined,
  );
  const [sendNotification, setSendNotification] = useState(true);

  // Handle clearing selection when parent triggers it
  useEffect(() => {
    if (clearSelectionTrigger !== undefined && clearSelectionTrigger > 0) {
      setSelectedUserIds([]);
      setSelectedRole(FilePermissionRole.VIEWER);
      setShareMessage(undefined);
      setSendNotification(true);
      onSelectionChange?.(false);
    }
  }, [clearSelectionTrigger, onSelectionChange]);

  const currentUser = useAtomValue(authAtom)?.user as UserProfileDto;

  const { mutateAsync: shareFile, isPending: isSharing } = useShareFile();
  const { mutateAsync: shareFilePublic, isPending: isSharingPublic } =
    useShareFilePublic();
  const { mutateAsync: unshareFilePublic } = useUnshareFilePublic();
  const { mutateAsync: updatePermissionRole } = useUpdatePermissionRole();
  const { mutateAsync: revokePermission } = useRevokePermission();

  const { data: filePermissions, isLoading: isLoadingPermissions } =
    useGetFilePermissions({
      fileId: item.id,
      enabled: true,
    });

  // Check for public sharing and update state accordingly
  useEffect(() => {
    if (filePermissions) {
      const publicPermission = filePermissions.find(
        (permission) => permission.userId === null && permission.user === null,
      );

      if (publicPermission) {
        setPublicAccessType(PUBLIC_ACCESS_TYPE.ANYONE);
        setPublicAccessRole(
          mapFilePermissionToPublicRole(publicPermission.role),
        );
      } else {
        setPublicAccessType(PUBLIC_ACCESS_TYPE.LIMITED);
      }
    }
  }, [filePermissions]);

  // Get users from API - load initial users for the dropdown
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetUsers({
    filters: { pageSize: 10, page: 1, noAccessOnFileId: item.id },
    staleTime: 30 * 1000, // Cache results for 30 seconds
  });

  const apiUsers = usersResponse?.items || [];

  const handleValuesChange = (userIds: string[]) => {
    setSelectedUserIds(userIds);
    onSelectionChange?.(userIds.length > 0);
  };

  const handleShare = async () => {
    if (selectedUserIds.length === 0) return;

    try {
      await shareFile({
        fileId: item.id,
        dto: {
          userIds: selectedUserIds,
          role: selectedRole,
          message: shareMessage,
          sendNotification: sendNotification,
        },
      });

      // Reset form
      setSelectedUserIds([]);
      setSelectedRole(FilePermissionRole.VIEWER);
      setShareMessage('');
      setSendNotification(true);
      onSelectionChange?.(false);
    } catch (error) {
      console.error('Failed to share file:', error);
    }
  };

  const handleRoleChange = async (
    permissionId: string,
    newRole: FilePermissionRole,
  ) => {
    try {
      await updatePermissionRole({
        fileId: item.id,
        permissionId,
        dto: { role: newRole },
      });
    } catch (error) {
      console.error('Failed to update permission role:', error);
    }
  };

  const handleRemoveAccess = async (permissionId: string) => {
    try {
      await revokePermission({
        fileId: item.id,
        permissionId,
      });
    } catch (error) {
      console.error('Failed to remove access:', error);
    }
  };
  // Public access handlers
  const handlePublicAccessTypeChange = async (value: PublicAccessType) => {
    setPublicAccessType(value);

    try {
      if (value === PUBLIC_ACCESS_TYPE.LIMITED) {
        // Remove public sharing
        await unshareFilePublic(item.id);
        setPublicAccessRole(PUBLIC_ACCESS_ROLE.VIEW);
      } else if (value === PUBLIC_ACCESS_TYPE.ANYONE) {
        // Enable public sharing
        await shareFilePublic({
          fileId: item.id,
          dto: {
            role: mapPublicRoleToFilePermission(publicAccessRole),
          },
        });
      }
    } catch (error) {
      console.error('Failed to update public access:', error);
      // Revert the UI state on error
      setPublicAccessType(
        value === PUBLIC_ACCESS_TYPE.LIMITED
          ? PUBLIC_ACCESS_TYPE.ANYONE
          : PUBLIC_ACCESS_TYPE.LIMITED,
      );
    }
  };

  const handlePublicAccessRoleChange = async (value: PublicAccessRole) => {
    setPublicAccessRole(value);

    if (publicAccessType === PUBLIC_ACCESS_TYPE.ANYONE) {
      try {
        await shareFilePublic({
          fileId: item.id,
          dto: {
            role: mapPublicRoleToFilePermission(value),
          },
        });
      } catch (error) {
        console.error('Failed to update public access role:', error);
        // Revert the UI state on error
        setPublicAccessRole(
          value === PUBLIC_ACCESS_ROLE.VIEW
            ? PUBLIC_ACCESS_ROLE.EDIT
            : PUBLIC_ACCESS_ROLE.VIEW,
        );
      }
    }
  };

  console.log('Rendering SharePeopleTab with item:', item);

  // Main view
  return (
    <div className="space-y-4">
      {/* Share with new people */}
      <div className="space-y-4">
        <div className="grid grid-cols-5 items-start gap-2">
          <div
            className={cn(
              'relative col-span-3 md:col-span-4',
              selectedUserIds.length === 0 && 'col-span-full',
            )}
          >
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

          {/* Show role selector when users are selected */}
          {selectedUserIds.length > 0 && (
            <div className="col-span-2 flex items-center justify-end md:col-span-1">
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setSelectedRole(value as FilePermissionRole)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FilePermissionRole.VIEWER}>
                    Viewer
                  </SelectItem>
                  <SelectItem value={FilePermissionRole.EDITOR}>
                    Editor
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Show notification checkbox, message textarea and send button when users are selected */}
        {selectedUserIds.length > 0 && (
          <>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="send-notification"
                checked={sendNotification}
                onCheckedChange={(checked) =>
                  setSendNotification(checked === true)
                }
              />
              <label
                htmlFor="send-notification"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send notification
              </label>
            </div>

            <div className="space-y-3">
              <label className="mb-1 text-sm font-medium">
                Message (optional)
              </label>
              <Textarea
                placeholder="Add a message..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleShare} disabled={isSharing}>
                {isSharing ? 'Sharing...' : 'Send'}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Only show these sections when no users are selected for sharing */}
      {selectedUserIds.length === 0 && (
        <>
          <ClipboardInput
            value={`${Env.VITE_FRONTEND_URL}/${item.isFolder ? 'folders' : 'files'}/${item.id}`}
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
              <div className="md-pr-3 max-h-[150px] space-y-3 overflow-y-auto pr-2">
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

                {/* Shared users - exclude the owner and public permissions from list */}
                {filePermissions
                  ?.filter(
                    (permission: FilePermissionDto) =>
                      permission?.user?.id &&
                      permission.user.id !== item.owner.id &&
                      permission.userId !== null, // Exclude public permissions
                  )
                  .map((permission: FilePermissionDto) => {
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
                                {permission.user.firstName}{' '}
                                {permission.user.lastName}
                                {currentUser.id === permission.user.id &&
                                  ' (You)'}
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
                            <SelectItem value="REVOKE">
                              Revoke access
                            </SelectItem>
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
                    onValueChange={handlePublicAccessRoleChange}
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
                onValueChange={handlePublicAccessTypeChange}
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
                      <span className="text-heading">
                        Anyone who has the link
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Anyone with the link can {publicAccessRole}
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
