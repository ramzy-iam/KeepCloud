import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FolderFilterDto,
  FileMinViewDto,
  UserStorageDto,
  StorageBreakdownDto,
  BulkDeleteResultDto,
  BulkTrashResultDto,
  BulkRestoreResultDto,
} from '@keepcloud/commons/dtos';
import { StorageService, ApiError } from '../services';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { FileHelper } from '@keepcloud/commons/helpers';
import { useGetActiveFolder } from './folder.hook';
import {
  updateFileEverywhere,
  useFileListUpdater,
  removeFileEverywhere,
} from './use-file-list-updater.hook';
import { useAtomValue } from 'jotai';
import { authAtom } from '../atoms';
import { useInfiniteListQuery } from './use-infinite-list-query.hook';
import { queryKeys, getActiveFolderInvalidationKey } from '../query-keys';

interface StorageQueryProps {
  filters?: FolderFilterDto;
  enabled?: boolean;
  staleTime?: number;
}

interface RenameResourceProps {
  parentId: string;
}

export const useGetRootItems = ({
  filters = {},
  enabled = true,
}: StorageQueryProps = {}) => {
  const authState = useAtomValue(authAtom);
  if (!authState?.user?.root) {
    throw new Error('User root folder is not available');
  }
  return useInfiniteListQuery<FileMinViewDto>({
    queryKey: queryKeys.storage.myStorage,
    listKey: authState.user.root,
    enabled: enabled && !!authState.user.root,
    fetchFn: async (page) => {
      return StorageService.getRootItems({ ...filters, page });
    },
  });
};

export const useGetSharedWithMe = ({
  filters = {},
  enabled = true,
}: StorageQueryProps = {}) => {
  return useInfiniteListQuery<FileMinViewDto>({
    queryKey: queryKeys.storage.sharedWithMe,
    listKey: SYSTEM_FILE.SHARED_WITH_ME.id,
    enabled,
    fetchFn: async (page) => {
      return StorageService.getSharedWithMe({ ...filters, page });
    },
  });
};

export const useGetTrashedItems = ({
  filters = {},
  enabled = true,
}: StorageQueryProps = {}) => {
  return useInfiniteListQuery<FileMinViewDto>({
    queryKey: queryKeys.storage.trash,
    listKey: SYSTEM_FILE.TRASH.id,
    enabled,
    fetchFn: async (page) => {
      return StorageService.getTrashedItems({ ...filters, page });
    },
  });
};

export const useGetSuggestedFolders = () => {
  return useInfiniteListQuery<FileMinViewDto>({
    queryKey: queryKeys.storage.suggestedFolders,
    listKey: SYSTEM_FILE.SUGGESTED_FOLDERS.id,
    enabled: true,
    fetchFn: async (page) => StorageService.getSuggestedFolders({ page }),
  });
};

export const useGetSuggestedFiles = () => {
  return useInfiniteListQuery<FileMinViewDto>({
    queryKey: queryKeys.storage.suggestedFiles,
    listKey: SYSTEM_FILE.SUGGESTED_FILES.id,
    enabled: true,
    fetchFn: async (page) => StorageService.getSuggestedFiles({ page }),
  });
};

export const useGetKeyToInvalidateBasedOnActiveFolder = () => {
  const { activeFolder } = useGetActiveFolder();
  return getActiveFolderInvalidationKey(activeFolder);
};

export const useGetFoldersForTree = ({
  filters = {},
  enabled = true,
  staleTime,
}: StorageQueryProps = {}) => {
  return useInfiniteListQuery<FileMinViewDto>({
    queryKey: queryKeys.storage.tree(filters.parentId),
    listKey: `tree-${filters.parentId}`,
    enabled,
    fetchFn: async (page) =>
      StorageService.getFoldersForTree({ ...filters, page }),
    staleTime,
  });
};

export const useRenameResource = ({ parentId }: RenameResourceProps) => {
  const { updateItemName } = useFileListUpdater(parentId);
  const queryClient = useQueryClient();

  return useMutation<FileMinViewDto, ApiError, { id: string; name: string }>({
    mutationFn: ({ id, name }) => StorageService.rename(id, name),
    onSuccess: (data, { id: fileId }) => {
      queryClient.refetchQueries({
        queryKey: queryKeys.file.presignedGet(fileId),
      });
      updateItemName(data.id, data.name);
      updateFileEverywhere(data.id, (file) => ({
        ...file,
        name: data.name,
      }));
    },
  });
};

export const useMoveToTrash = ({ parentId }: { parentId: string }) => {
  const invalidateCache = useInvalidateFileOperationCache();

  return useMutation<FileMinViewDto, ApiError, string>({
    mutationFn: (id) => StorageService.moveToTrash(id),
    onSuccess: (_, id) => {
      removeFileEverywhere(id);
      invalidateCache(parentId);
    },
  });
};

export const useRestoreResource = () => {
  const { removeItem } = useFileListUpdater(SYSTEM_FILE.TRASH.id);
  const invalidateCache = useInvalidateFileOperationCache();

  return useMutation<FileMinViewDto, ApiError, string>({
    mutationFn: (id) => StorageService.restore(id),
    onSuccess: (restoredFile, id) => {
      // Remove from trash
      removeItem(id);

      // Invalidate cache for the folder where the file was restored to
      if (restoredFile.parentId) {
        invalidateCache(restoredFile.parentId);
      }
    },
  });
};

export const useDeletePermanently = () => {
  const queryClient = useQueryClient();
  const { removeItem } = useFileListUpdater(SYSTEM_FILE.TRASH.id);
  const refreshStorageData = useRefreshStorageData();
  return useMutation<FileMinViewDto, ApiError, string>({
    mutationFn: (id) => StorageService.deletePermanently(id),
    onSuccess: (_, id) => {
      removeItem(id);
      updateFileEverywhere(id, () => null);
      queryClient.invalidateQueries({ queryKey: queryKeys.storage.trash });
      refreshStorageData();
    },
  });
};

export const useGetUserStorage = () => {
  return useQuery<UserStorageDto, ApiError>({
    queryKey: queryKeys.storage.usage,
    queryFn: () => StorageService.getUserStorage(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useGetStorageBreakdown = () => {
  return useQuery<StorageBreakdownDto, ApiError>({
    queryKey: queryKeys.storage.breakdown,
    queryFn: () => StorageService.getStorageBreakdown(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useRefreshStorageData = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.refetchQueries({ queryKey: queryKeys.storage.usage });
    queryClient.refetchQueries({ queryKey: queryKeys.storage.breakdown });
  };
};

export const useRefreshSuggestions = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.refetchQueries({ queryKey: queryKeys.storage.suggestedFiles });
    queryClient.refetchQueries({
      queryKey: queryKeys.storage.suggestedFolders,
    });
  };
};

/**
 * Invalidates cache for file operations that affect folder contents
 * Used when files are moved to trash, restored, or permanently deleted
 */
export const useInvalidateFileOperationCache = () => {
  const queryClient = useQueryClient();
  const refreshSuggestions = useRefreshSuggestions();

  return (parentId: string) => {
    const actualParentId = FileHelper.getValidParentId(parentId);

    queryClient.invalidateQueries({
      queryKey: queryKeys.folder.children(actualParentId),
    });

    queryClient.invalidateQueries({
      queryKey: queryKeys.storage.myStorage,
    });

    queryClient.invalidateQueries({
      queryKey: queryKeys.storage.tree(actualParentId),
    });

    // Also invalidate the tree for the original parent if it's different
    if (parentId !== actualParentId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.storage.tree(parentId),
      });
    }

    // Always invalidate trash cache since files are moved to/from trash
    queryClient.invalidateQueries({
      queryKey: queryKeys.storage.trash,
    });

    // Refresh suggestions as they might be affected
    refreshSuggestions();
  };
};

export const useBulkMoveToTrash = () => {
  const refreshStorageData = useRefreshStorageData();
  const invalidateCache = useInvalidateFileOperationCache();

  return useMutation<BulkTrashResultDto[], ApiError, string[]>({
    mutationFn: (fileIds) => StorageService.bulkMoveToTrash(fileIds),
    onSuccess: (results) => {
      const parentIds = new Set<string>();

      results.forEach((result) => {
        if (result.success) {
          removeFileEverywhere(result.id);
          // Collect unique parent IDs from successful operations
          if (result.file?.parentId) {
            parentIds.add(result.file.parentId);
          }
        }
      });

      // Invalidate cache for all affected parent folders
      parentIds.forEach((parentId) => {
        invalidateCache(parentId);
      });

      refreshStorageData();
    },
  });
};

export const useBulkRestore = () => {
  const refreshStorageData = useRefreshStorageData();

  return useMutation<BulkRestoreResultDto[], ApiError, string[]>({
    mutationFn: (fileIds) => StorageService.bulkRestore(fileIds),
    onSuccess: (results) => {
      results.forEach((result) => {
        if (result.success) {
          removeFileEverywhere(result.id);
        }
      });
      refreshStorageData();
    },
  });
};

export const useBulkDelete = () => {
  const refreshStorageData = useRefreshStorageData();
  const queryClient = useQueryClient();

  return useMutation<BulkDeleteResultDto[], ApiError, string[]>({
    mutationFn: (fileIds) => StorageService.bulkDelete(fileIds),
    onSuccess: (results) => {
      results.forEach((result) => {
        if (result.success) {
          removeFileEverywhere(result.id);
        }
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.storage.trash });
      refreshStorageData();
    },
  });
};
