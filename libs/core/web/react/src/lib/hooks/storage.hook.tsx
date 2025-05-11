import { useQuery } from '@tanstack/react-query';
import {
  PaginationDto,
  FolderFilterDto,
  FileMinViewDto,
} from '@keepcloud/commons/dtos';
import { StorageService, ApiError } from '../services';

interface StorageQueryProps {
  filters?: FolderFilterDto;
  enabled?: boolean;
}

export const useGetRootItems = ({
  filters = {},
  enabled = true,
}: StorageQueryProps = {}) => {
  return useQuery<PaginationDto<FileMinViewDto>, ApiError>({
    queryKey: ['storage', 'root', filters],
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
    queryKey: ['storage', 'shared', filters],
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
    queryKey: ['storage', 'trash', filters],
    queryFn: () => {
      return StorageService.getTrashedItems(filters);
    },
    enabled,
    retry: false,
  });
};
