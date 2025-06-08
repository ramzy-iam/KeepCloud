import { useMutation, useQuery } from '@tanstack/react-query';
import {
  PaginationDto,
  FolderFilterDto,
  FileMinViewDto,
} from '@keepcloud/commons/dtos';
import { StorageService, ApiError } from '../services';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { useGetActiveFolder } from './folder.hook';
import {
  updateFileEverywhere,
  useFileListUpdater,
} from './use-file-list-updater.hook';
import { useSyncedListFromQuery } from './use-sync-list-from-query.hook';

interface StorageQueryProps {
  filters?: FolderFilterDto;
  enabled?: boolean;
}

interface RenameResourceProps {
  parentId: string;
}

export const useGetRootItems = ({
  filters = {},
  enabled = true,
}: StorageQueryProps = {}) => {
  const query = useQuery<PaginationDto<FileMinViewDto>, ApiError>({
    queryKey: [SYSTEM_FILE.MY_STORAGE.invalidationKey],
    queryFn: () => {
      return StorageService.getRootItems(filters);
    },
    enabled,
    retry: false,
  });
  return useSyncedListFromQuery(query, SYSTEM_FILE.MY_STORAGE.id);
};

export const useGetSharedWithMe = ({
  filters = {},
  enabled = true,
}: StorageQueryProps = {}) => {
  const query = useQuery<PaginationDto<FileMinViewDto>, ApiError>({
    queryKey: [SYSTEM_FILE.SHARED_WITH_ME.invalidationKey],
    queryFn: () => {
      return StorageService.getSharedWithMe(filters);
    },
    enabled,
    retry: false,
  });

  return useSyncedListFromQuery(query, SYSTEM_FILE.SHARED_WITH_ME.id);
};

export const useGetTrashedItems = ({
  filters = {},
  enabled = true,
}: StorageQueryProps = {}) => {
  const query = useQuery<PaginationDto<FileMinViewDto>, ApiError>({
    queryKey: [SYSTEM_FILE.TRASH.invalidationKey],
    queryFn: () => {
      return StorageService.getTrashedItems(filters);
    },
    enabled,
    retry: false,
  });

  return useSyncedListFromQuery(query, SYSTEM_FILE.TRASH.id);
};

export const useGetKeyToInvalidateBasedOnActiveFolder = () => {
  const { activeFolder } = useGetActiveFolder();
  if (activeFolder.isSystem) {
    return [activeFolder.invalidationKey];
  }
  return ['folder', activeFolder.id, 'children'];
};

export const useGetSuggestedFolders = () => {
  const query = useQuery<FileMinViewDto[], ApiError>({
    queryKey: ['storage', 'suggested-folders'],
    queryFn: async () => {
      const data = await StorageService.getSuggestedFolders();
      return data.items;
    },
    enabled: true,
    retry: false,
  });
  return useSyncedListFromQuery(query, SYSTEM_FILE.SUGGESTED_FOLDERS.id);
};

export const useGetSuggestedFiles = () => {
  const query = useQuery<FileMinViewDto[], ApiError>({
    queryKey: ['storage', 'suggested-files'],
    queryFn: async () => {
      const data = await StorageService.getSuggestedFiles();
      const items = data.items;
      return items;
    },
    enabled: true,
    retry: false,
  });
  return useSyncedListFromQuery(query, SYSTEM_FILE.SUGGESTED_FILES.id);
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

export const useRenameResource = ({ parentId }: RenameResourceProps) => {
  const { updateItemName } = useFileListUpdater(parentId);

  return useMutation<FileMinViewDto, ApiError, { id: string; name: string }>({
    mutationFn: ({ id, name }) => StorageService.rename(id, name),
    onSuccess: (data) => {
      updateItemName(data.id, data.name);
      updateFileEverywhere(data.id, (file) => ({
        ...file,
        name: data.name,
      }));
    },
  });
};

export const useMoveToTrash = ({ parentId }: { parentId: string }) => {
  const { removeItem } = useFileListUpdater(parentId);

  return useMutation<FileMinViewDto, ApiError, string>({
    mutationFn: (id) => StorageService.moveToTrash(id),
    onSuccess: (_, id) => {
      removeItem(id);
    },
  });
};

export const useRestoreResource = () => {
  const { removeItem } = useFileListUpdater(SYSTEM_FILE.TRASH.id);
  return useMutation<FileMinViewDto, ApiError, string>({
    mutationFn: (id) => StorageService.restore(id),
    onSuccess: (_, id) => {
      removeItem(id);
    },
  });
};

export const useDeletePermanently = () => {
  const { removeItem } = useFileListUpdater(SYSTEM_FILE.TRASH.id);
  return useMutation<FileMinViewDto, ApiError, string>({
    mutationFn: (id) => StorageService.deletePermanently(id),
    onSuccess: (_, id) => {
      removeItem(id);
      updateFileEverywhere(id, () => null);
    },
  });
};
