import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FilePermissionRole } from '@prisma/client';
import {
  FilePermissionDto,
  ShareLinkDto,
  CreateShareLinkDto,
  UpdateShareLinkDto,
} from '@keepcloud/commons/dtos';

// Mock API functions - replace with actual API calls
const sharingApi = {
  shareFile: async (data: {
    fileId: string;
    userIds: string[];
    role: FilePermissionRole;
  }) => {
    // Mock API call
    console.log('Sharing file:', data);
    return { success: true };
  },

  getFilePermissions: async (fileId: string): Promise<FilePermissionDto[]> => {
    // Mock API call - return empty array for now
    console.log('Getting permissions for file:', fileId);
    return [];
  },

  updatePermission: async (data: {
    permissionId: string;
    role: FilePermissionRole;
  }) => {
    // Mock API call
    console.log('Updating permission:', data);
    return { success: true };
  },

  revokePermission: async (data: { fileId: string; permissionId: string }) => {
    // Mock API call
    console.log('Revoking permission:', data);
    return { success: true };
  },

  createShareLink: async (data: CreateShareLinkDto): Promise<ShareLinkDto> => {
    // Mock API call
    console.log('Creating share link:', data);
    return {
      id: 'mock-link-id',
      token: 'mock-token-' + Date.now(),
      fileId: data.fileId,
      access: data.access || 'restricted',
      role: data.role,
      expiresAt: data.expiresAt || null,
      accessCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  getShareLink: async (fileId: string): Promise<ShareLinkDto | null> => {
    // Mock API call - return null for now (no existing link)
    console.log('Getting share link for file:', fileId);
    return null;
  },

  updateShareLink: async (data: UpdateShareLinkDto): Promise<ShareLinkDto> => {
    // Mock API call
    console.log('Updating share link:', data);
    return {
      id: data.linkId,
      token: 'mock-token-updated',
      fileId: 'mock-file-id',
      access: data.access || 'restricted',
      role: data.role || FilePermissionRole.VIEWER,
      expiresAt: data.expiresAt || null,
      accessCount: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  deleteShareLink: async (data: { fileId: string; linkId: string }) => {
    // Mock API call
    console.log('Deleting share link:', data);
    return { success: true };
  },
};

// Hook for sharing files with users
export function useShareFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sharingApi.shareFile,
    onSuccess: (_, variables) => {
      // Invalidate file permissions query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['filePermissions', variables.fileId],
      });
    },
  });
}

// Hook for getting file permissions
export function useGetFilePermissions(fileId: string) {
  return useQuery({
    queryKey: ['filePermissions', fileId],
    queryFn: () => sharingApi.getFilePermissions(fileId),
    enabled: !!fileId,
  });
}

// Hook for updating permission role
export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sharingApi.updatePermission,
    onSuccess: () => {
      // Invalidate all file permissions queries
      queryClient.invalidateQueries({
        queryKey: ['filePermissions'],
      });
    },
  });
}

// Hook for revoking permission
export function useRevokePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sharingApi.revokePermission,
    onSuccess: (_, variables) => {
      // Invalidate file permissions query
      queryClient.invalidateQueries({
        queryKey: ['filePermissions', variables.fileId],
      });
    },
  });
}

// Hook for creating share links
export function useCreateShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sharingApi.createShareLink,
    onSuccess: (_, variables) => {
      // Invalidate share link query to show the new link
      queryClient.invalidateQueries({
        queryKey: ['shareLink', variables.fileId],
      });
    },
  });
}

// Hook for getting share link
export function useGetShareLink(fileId: string) {
  return useQuery({
    queryKey: ['shareLink', fileId],
    queryFn: () => sharingApi.getShareLink(fileId),
    enabled: !!fileId,
  });
}

// Hook for updating share links
export function useUpdateShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sharingApi.updateShareLink,
    onSuccess: (result) => {
      // Update the share link in cache
      queryClient.setQueryData(['shareLink', result.fileId], result);
    },
  });
}

// Hook for deleting share links
export function useDeleteShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sharingApi.deleteShareLink,
    onSuccess: (_, variables) => {
      // Remove the share link from cache
      queryClient.setQueryData(['shareLink', variables.fileId], null);
    },
  });
}
