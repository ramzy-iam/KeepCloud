import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ShareFileDto,
  ShareFilePublicDto,
  UpdateFilePermissionDto,
  FilePermissionDto,
} from '@keepcloud/commons/dtos';
import { ApiError, FileShareService } from '../services';
import { toast } from 'sonner';
import { queryKeys } from '../query-keys';

export const useShareFile = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { fileId: string; dto: ShareFileDto }>({
    mutationFn: ({ fileId, dto }) => FileShareService.shareFile(fileId, dto),
    onSuccess: (_, { fileId }) => {
      toast.success('File shared successfully');
      // Only invalidate file permissions to avoid double fetching
      queryClient.invalidateQueries({
        queryKey: queryKeys.file.permissions(fileId),
      });
    },
    onError: (error) => {
      const message = error.details?.[0]?.message || 'Failed to share file';
      toast.error(message);
    },
  });
};

export const useShareFilePublic = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ApiError,
    { fileId: string; dto: ShareFilePublicDto }
  >({
    mutationFn: ({ fileId, dto }) =>
      FileShareService.shareFilePublic(fileId, dto),
    onSuccess: (_, { fileId }) => {
      toast.success('File shared publicly');
      // Only invalidate file permissions to avoid double fetching
      queryClient.invalidateQueries({
        queryKey: queryKeys.file.permissions(fileId),
      });
    },
    onError: (error) => {
      const message =
        error.details?.[0]?.message || 'Failed to share file publicly';
      toast.error(message);
    },
  });
};

export const useUnshareFilePublic = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (fileId) => FileShareService.unshareFilePublic(fileId),
    onSuccess: (_, fileId) => {
      toast.success('Public sharing removed');
      // Only invalidate file permissions to avoid double fetching
      queryClient.invalidateQueries({
        queryKey: queryKeys.file.permissions(fileId),
      });
    },
    onError: (error) => {
      const message =
        error.details?.[0]?.message || 'Failed to remove public sharing';
      toast.error(message);
    },
  });
};

// Hook for revoking a specific permission
export const useRevokePermission = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { fileId: string; permissionId: string }>({
    mutationFn: ({ fileId, permissionId }) =>
      FileShareService.revokePermission(fileId, permissionId),
    onSuccess: (_, { fileId }) => {
      toast.success('Permission revoked');
      // Only invalidate file permissions to avoid double fetching
      queryClient.invalidateQueries({
        queryKey: queryKeys.file.permissions(fileId),
      });
    },
    onError: (error) => {
      const message =
        error.details?.[0]?.message || 'Failed to revoke permission';
      toast.error(message);
    },
  });
};

export const useUpdatePermissionRole = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ApiError,
    {
      fileId: string;
      permissionId: string;
      dto: UpdateFilePermissionDto;
    }
  >({
    mutationFn: ({ fileId, permissionId, dto }) =>
      FileShareService.updatePermissionRole(fileId, permissionId, dto),
    onSuccess: (_, { fileId }) => {
      toast.success('Permission updated');
      // Only invalidate file permissions to avoid double fetching
      queryClient.invalidateQueries({
        queryKey: queryKeys.file.permissions(fileId),
      });
    },
    onError: (error) => {
      const message =
        error.details?.[0]?.message || 'Failed to update permission';
      toast.error(message);
    },
  });
};

// Hook for removing a collaborator
export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { fileId: string; userId: string }>({
    mutationFn: ({ fileId, userId }) =>
      FileShareService.removeCollaborator(fileId, userId),
    onSuccess: (_, { fileId }) => {
      toast.success('Collaborator removed');
      // Only invalidate file permissions to avoid double fetching
      queryClient.invalidateQueries({
        queryKey: queryKeys.file.permissions(fileId),
      });
    },
    onError: (error) => {
      const message =
        error.details?.[0]?.message || 'Failed to remove collaborator';
      toast.error(message);
    },
  });
};

interface UseGetFilePermissionsProps {
  fileId?: string;
  enabled?: boolean;
}

export const useGetFilePermissions = ({
  fileId,
  enabled = true,
}: UseGetFilePermissionsProps) => {
  return useQuery<FilePermissionDto[], ApiError>({
    queryKey: queryKeys.file.permissions(fileId as string),
    queryFn: () => FileShareService.getPermissions(fileId as string),
    enabled: Boolean(fileId) && enabled,
    retry: false,
    staleTime: 30_000, // Cache for 30 seconds
  });
};
