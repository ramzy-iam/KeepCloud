import { useState, useEffect } from 'react';
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@keepcloud/web-core/react';
import {
  FileMinViewDto,
  FilePermissionDto,
  UserProfileDto,
} from '@keepcloud/commons/dtos';
import { FilePermissionRole } from '@prisma/client';
import {
  Search,
  UserPlus,
  Crown,
  Edit,
  Eye,
  Trash2,
  X,
  Check,
} from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserProfileDto[]>([]);
  const [selectedRole, setSelectedRole] = useState<FilePermissionRole>(
    FilePermissionRole.VIEWER,
  );
  const [isOpen, setIsOpen] = useState(false);

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const shareFile = {
    mutateAsync: async () => console.log('Share file called'),
    isPending: false,
  };
  const revokePermission = { isPending: false };
  const permissions: FilePermissionDto[] = []; // Empty array for now
  const isLoadingPermissions = false;
  const refetchPermissions = () => console.log('Refetch permissions called');

  // Get users from API with debounced search query
  // Search when popover is open - load initial users or search results
  const shouldFetchUsers = isOpen;
  const searchFilters = debouncedSearchQuery.trim()
    ? { query: debouncedSearchQuery.trim() }
    : { pageSize: 20 }; // Load first 20 users when no search query

  const { data: usersResponse, isLoading: isLoadingUsers } = useGetUsers({
    filters: searchFilters,
    enabled: shouldFetchUsers,
    staleTime: 30 * 1000, // Cache results for 30 seconds
  });

  const apiUsers = usersResponse?.items || [];

  // Filter out already selected users (search is handled by API)
  const filteredUsers = apiUsers.filter(
    (user: UserProfileDto) =>
      !selectedUsers.some((selected) => selected.id === user.id),
  );

  const handleSelectUser = (user: UserProfileDto) => {
    setSelectedUsers((prev) => [...prev, user]);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) return;

    try {
      console.log('Sharing file with users:', {
        fileId: item.id,
        userIds: selectedUsers.map((user) => user.id),
        role: selectedRole,
      });

      setSelectedUsers([]);
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
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <div className="relative min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <div className="flex flex-wrap items-center gap-1">
                    {/* Display selected users as pills */}
                    {selectedUsers.map((user) => (
                      <Badge
                        key={user.id}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1 text-xs"
                      >
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveUser(user.id);
                          }}
                          className="ml-1 rounded-full p-0.5 hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}

                    {/* Input for searching */}
                    <input
                      placeholder={
                        selectedUsers.length === 0
                          ? 'Add people by name or email'
                          : 'Add more people...'
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsOpen(true)}
                      className="min-w-32 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                    />

                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </PopoverTrigger>

              <PopoverContent className="w-80 p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search people..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    {isLoadingUsers ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Loading users...
                      </div>
                    ) : (
                      <CommandEmpty>No users found.</CommandEmpty>
                    )}
                    <CommandGroup>
                      {!isLoadingUsers &&
                        filteredUsers.map((user: UserProfileDto) => (
                          <CommandItem
                            key={user.id}
                            onSelect={() => handleSelectUser(user)}
                            className="flex cursor-pointer items-center gap-3"
                          >
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
                            <Check className="h-4 w-4 opacity-0" />
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
            disabled={selectedUsers.length === 0 || shareFile.isPending}
            className="shrink-0"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {selectedUsers.length > 0 && (
            <>
              {selectedUsers.length}{' '}
              {selectedUsers.length === 1 ? 'person' : 'people'} selected. They
              will be able to{' '}
              {selectedRole === FilePermissionRole.EDITOR
                ? 'view and edit'
                : 'view'}{' '}
              this {item.isFolder ? 'folder' : 'file'}.
            </>
          )}
          {selectedUsers.length === 0 && (
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
