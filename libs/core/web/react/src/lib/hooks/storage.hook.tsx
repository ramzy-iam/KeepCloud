import { useQuery } from '@tanstack/react-query';
import {
  PaginationDto,
  FolderFilterDto,
  FileMinViewDto,
} from '@keepcloud/commons/dtos';
import { StorageService, ApiError } from '../services';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { useGetActiveFolder } from './folder.hook';

interface StorageQueryProps {
  filters?: FolderFilterDto;
  enabled?: boolean;
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
    queryKey: [SYSTEM_FILE.SHARED_WITH_ME.invalidationKey],
    queryFn: () => {
      return StorageService.getTrashedItems(filters);
    },
    enabled,
    retry: false,
  });
};

export const useGetKeyToInvalidateBasedOnActiveFolder = () => {
  const { activeFolder } = useGetActiveFolder();
  if (activeFolder.system) {
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
