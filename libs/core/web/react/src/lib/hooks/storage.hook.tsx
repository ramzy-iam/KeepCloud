import { useMutation } from '@tanstack/react-query';
import { FolderFilterDto, FileMinViewDto } from '@keepcloud/commons/dtos';
import { StorageService, ApiError } from '../services';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { useGetActiveFolder } from './folder.hook';
import {
  updateFileEverywhere,
  useFileListUpdater,
} from './use-file-list-updater.hook';
import { useAtomValue } from 'jotai';
import { authAtom } from '../atoms';
import { useInfiniteListQuery } from './use-infinite-list-query';

interface StorageQueryProps {
  filters?: FolderFilterDto;
  enabled?: boolean;
}

interface RenameResourceProps {
  parentId: string;
}

interface StorageQueryProps {
  filters?: FolderFilterDto;
  enabled?: boolean;
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
    queryKey: [SYSTEM_FILE.MY_STORAGE.invalidationKey],
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
    queryKey: [SYSTEM_FILE.SHARED_WITH_ME.invalidationKey],
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
    queryKey: [SYSTEM_FILE.TRASH.invalidationKey],
    listKey: SYSTEM_FILE.TRASH.id,
    enabled,
    fetchFn: async (page) => {
      return StorageService.getTrashedItems({ ...filters, page });
    },
  });
};

export const useGetSuggestedFolders = () => {
  return useInfiniteListQuery<FileMinViewDto>({
    queryKey: ['storage', 'suggested-folders'],
    listKey: SYSTEM_FILE.SUGGESTED_FOLDERS.id,
    enabled: true,
    fetchFn: async (page) => StorageService.getSuggestedFolders({ page }),
  });
};

export const useGetSuggestedFiles = () => {
  return useInfiniteListQuery<FileMinViewDto>({
    queryKey: ['storage', 'suggested-files'],
    listKey: SYSTEM_FILE.SUGGESTED_FILES.id,
    enabled: true,
    fetchFn: async (page) => StorageService.getSuggestedFiles({ page }),
  });
};

export const useGetKeyToInvalidateBasedOnActiveFolder = () => {
  const { activeFolder } = useGetActiveFolder();
  if (activeFolder.isSystem) {
    return [activeFolder.invalidationKey];
  }
  return ['folder', activeFolder.id, 'children'];
};

export const useGetFoldersForTree = ({
  filters = {},
  enabled = true,
}: StorageQueryProps = {}) => {
  return useInfiniteListQuery<FileMinViewDto>({
    queryKey: ['storage', 'tree', filters],
    listKey: 'tree',
    enabled,
    fetchFn: async (page) =>
      StorageService.getFoldersForTree({ ...filters, page }),
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
