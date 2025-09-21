import { useState } from 'react';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Badge,
  Skeleton,
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectGroup,
} from '@keepcloud/web-core/react';
import {
  FileMinViewDto,
  FilePermissionDto,
  UserProfileDto,
} from '@keepcloud/commons/dtos';
import { FilePermissionRole } from '@prisma/client';
import { UserPlus, Crown, Edit, Eye, Trash2 } from 'lucide-react';

import { useGetUsers } from '@keepcloud/web-core/react';
import { OwnerIcon } from '../../ui/owner-icon';

interface SharePeopleTabProps {
  item: FileMinViewDto;
}

const ROLE_ICONS = {
  [FilePermissionRole.OWNER]: Crown,
  [FilePermissionRole.EDITOR]: Edit,
  [FilePermissionRole.VIEWER]: Eye,
};

const ROLE_LABELS = {
  [FilePermissionRole.OWNER]: 'Owner',
  [FilePermissionRole.EDITOR]: 'Editor',
  [FilePermissionRole.VIEWER]: 'Viewer',
};

export function SharePeopleTab({ item }: SharePeopleTabProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<FilePermissionRole>(
    FilePermissionRole.VIEWER,
  );

  const shareFile = {
    mutateAsync: async () => console.log('Share file called'),
    isPending: false,
  };
  const revokePermission = { isPending: false };
  const permissions: FilePermissionDto[] = []; // Empty array for now
  const isLoadingPermissions = false;
  const refetchPermissions = () => console.log('Refetch permissions called');

  // Get users from API - load initial users for the dropdown
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetUsers({
    filters: { pageSize: 50 }, // Load first 50 users for selection
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

  return (
    <div className="space-y-6">
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
                          <div className="flex items-center gap-1">
                            <div className="[&>div]:h-4 [&>div]:w-4 [&>div>img]:h-4 [&>div>img]:w-4">
                              <OwnerIcon
                                user={user}
                                withName={false}
                                withTooltip={false}
                              />
                            </div>
                            <span>
                              {user.firstName} {user.lastName}
                            </span>
                          </div>
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
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Viewer
                </div>
              </SelectItem>
              <SelectItem value={FilePermissionRole.EDITOR}>
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Editor
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleShare}
            disabled={selectedUserIds.length === 0 || shareFile.isPending}
            className="shrink-0"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {selectedUserIds.length > 0 && (
            <>
              {selectedUserIds.length}{' '}
              {selectedUserIds.length === 1 ? 'person' : 'people'} selected.
              They will be able to{' '}
              {selectedRole === FilePermissionRole.EDITOR
                ? 'view and edit'
                : 'view'}{' '}
              this {item.isFolder ? 'folder' : 'file'}.
            </>
          )}
          {selectedUserIds.length === 0 && (
            <>
              Search and select people to share this{' '}
              {item.isFolder ? 'folder' : 'file'} with.
            </>
          )}
        </p>
      </div>

      <Separator />

      {/* Current permissions */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">People with access</h3>

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
          <div className="space-y-2">
            {/* Owner */}
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <OwnerIcon
                  user={item.owner}
                  withName={false}
                  withTooltip={false}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {item.owner.firstName} {item.owner.lastName}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      <Crown className="mr-1 h-3 w-3" />
                      Owner
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.owner.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Shared users */}
            {permissions?.map((permission: FilePermissionDto) => {
              const RoleIcon = ROLE_ICONS[permission.role];
              return (
                <div
                  key={permission.id}
                  className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/30"
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

                  <div className="flex items-center gap-2">
                    <Select
                      value={permission.role}
                      onValueChange={(value) =>
                        handleRoleChange(
                          permission.id,
                          value as FilePermissionRole,
                        )
                      }
                      // disabled={updatePermission.isPending}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <RoleIcon className="h-4 w-4" />
                            {ROLE_LABELS[permission.role]}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={FilePermissionRole.VIEWER}>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Viewer
                          </div>
                        </SelectItem>
                        <SelectItem value={FilePermissionRole.EDITOR}>
                          <div className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Editor
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAccess(permission.id)}
                      disabled={revokePermission.isPending}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {permissions?.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <UserPlus className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">No one else has access</p>
                <p className="text-xs">
                  Add people above to start collaborating
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
