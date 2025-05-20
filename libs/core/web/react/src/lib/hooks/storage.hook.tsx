import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  PaginationDto,
  FolderFilterDto,
  FileMinViewDto,
} from '@keepcloud/commons/dtos';
import { StorageService, ApiError, KeyToInvalidate } from '../services';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { useGetActiveFolder } from './folder.hook';
import { toast } from 'sonner';

interface StorageQueryProps {
  filters?: FolderFilterDto;
  enabled?: boolean;
}

interface RenameResourceProps extends KeyToInvalidate {
  resourceName: string;
}

export const useGetRootItems = ({
  filters = {},
  enabled = true,
}: StorageQueryProps = {}) => {
  return useQuery<PaginationDto<FileMinViewDto>, ApiError>({
    queryKey: [SYSTEM_FILE.MY_STORAGE.invalidationKey],
    queryFn: () => {
      return StorageService.getRootItems(filters);
    },
    enabled,
    retry: false,
  });
};

export const useGetSharedWithMe = ({
  filters = {},
  enabled = true,
}: StorageQueryProps = {}) => {
  return useQuery<PaginationDto<FileMinViewDto>, ApiError>({
    queryKey: [SYSTEM_FILE.SHARED_WITH_ME.invalidationKey],
    queryFn: () => {
      return StorageService.getSharedWithMe(filters);
    },
    enabled,
    retry: false,
  });
};

export const useGetTrashedItems = ({
  filters = {},
  enabled = true,
}: StorageQueryProps = {}) => {
  return useQuery<PaginationDto<FileMinViewDto>, ApiError>({
    queryKey: [SYSTEM_FILE.TRASH.invalidationKey],
    queryFn: () => {
      return StorageService.getTrashedItems(filters);
    },
    enabled,
    retry: false,
  });
};

export const useGetKeyToInvalidateBasedOnActiveFolder = () => {
  const { activeFolder } = useGetActiveFolder();
  if (activeFolder.isSystem) {
    return [activeFolder.invalidationKey];
  }
  return ['folder', activeFolder.id, 'children'];
};

export const useGetSuggestedFolders = () => {
  return useQuery<FileMinViewDto[], ApiError>({
    queryKey: ['storage', 'suggested-folders'],
    queryFn: async () => {
      const data = await StorageService.getSuggestedFolders();
      return data.items;
    },
    enabled: true,
    retry: false,
  });
};

export const useGetSuggestedFiles = () => {
  return useQuery<FileMinViewDto[], ApiError>({
    queryKey: ['storage', 'suggested-files'],
    queryFn: async () => {
      const data = await StorageService.getSuggestedFiles();
      return data.items;
    },
    enabled: true,
    retry: false,
  });
};

export const useGetFoldersForTree = ({
  filters = {},
  enabled = true,
}: StorageQueryProps = {}) => {
  return useQuery<PaginationDto<FileMinViewDto>, ApiError>({
    queryKey: ['storage', 'tree', filters],
    queryFn: () => {
      return StorageService.getFoldersForTree(filters);
    },
    enabled,
    retry: false,
  });
};

export const useRenameResource = ({
  keysToInvalidate,
  resourceName,
}: RenameResourceProps) => {
  const queryClient = useQueryClient();

  return useMutation<FileMinViewDto, ApiError, { id: string; name: string }>({
    mutationFn: ({ id, name }) => StorageService.rename(id, name),
    onSuccess: () => {
      toast.success(`${resourceName} renamed successfully`);
    },
    onSettled: () => {
      keysToInvalidate.map((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

export const useMoveToTrash = ({
  keysToInvalidate,
  resourceName,
}: RenameResourceProps) => {
  const queryClient = useQueryClient();
  return useMutation<FileMinViewDto, ApiError, string>({
    mutationFn: (id) => StorageService.moveToTrash(id),
    onSuccess: () => {
      toast.success(`${resourceName}  moved to trash`);
    },
    onSettled: () => {
      keysToInvalidate.map((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

export const useRestoreResource = ({
  keysToInvalidate,
  resourceName,
}: RenameResourceProps) => {
  const queryClient = useQueryClient();
  return useMutation<FileMinViewDto, ApiError, string>({
    mutationFn: (id) => StorageService.restore(id),
    onSuccess: () => {
      toast.success(`${resourceName} restored successfully`);
    },
    onSettled: () => {
      keysToInvalidate.map((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

export const useDeletePermanently = ({
  keysToInvalidate,
  resourceName,
}: RenameResourceProps) => {
  const queryClient = useQueryClient();
  return useMutation<FileMinViewDto, ApiError, string>({
    mutationFn: (id) => StorageService.deletePermanently(id),
    onSuccess: () => {
      toast.success(`${resourceName} deleted permanently`);
    },
    onSettled: () => {
      keysToInvalidate.map((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};
