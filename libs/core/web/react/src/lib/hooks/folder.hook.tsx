import { useQuery, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  CreateFolderDto,
  FolderFilterDto,
  PaginationDto,
  FileMinViewDto,
  FileDetailsDto,
  GetOneFolderQueryDto,
} from '@keepcloud/commons/dtos';
import { toast } from 'sonner';
import { FolderService, ApiError } from '../services';
import {
  ActiveFolder,
  DEFAULT_ACTIVE_FOLDER,
  activeFolderAtom,
} from '../store';
import { useAtomValue, useSetAtom } from 'jotai';

interface GetFolderProps {
  id: string;
  query?: GetOneFolderQueryDto;
  enabled?: boolean;
}

interface GetChildrenProps {
  id: string;
  filters?: FolderFilterDto;
  enabled?: boolean;
}

export const useGetActiveFolder = () => {
  const setFolder = useSetAtom(activeFolderAtom);
  return {
    setActiveFolder(folder: ActiveFolder) {
      setFolder(folder);
    },
    activeFolder: useAtomValue(activeFolderAtom),
    resetActiveFolder() {
      setFolder(DEFAULT_ACTIVE_FOLDER);
    },
  };
};

export const useCreateFolder = () => {
  return useMutation<FileMinViewDto, ApiError, CreateFolderDto>({
    mutationFn: async (dto) => {
      return FolderService.create(dto);
    },
    onSuccess: () => {
      toast.success('Folder created successfully');
    },
  });
};

export const useGetFolderChildren = ({
  id,
  filters = {},
  enabled = true,
}: GetChildrenProps) => {
  return useQuery<FileMinViewDto[], AxiosError>({
    queryKey: ['folder', id, 'children', filters],
    queryFn: async () => {
      const { items } = await FolderService.getChildren(id, filters);
      return items;
    },
    enabled: enabled && !!id,
    retry: false,
  });
};

export const useGetFolder = ({
  id,
  query = { withAncestors: true },
  enabled = true,
}: GetFolderProps) => {
  return useQuery<FileDetailsDto, ApiError>({
    queryKey: ['folder', id, query.withAncestors],
    queryFn: () => {
      return FolderService.getOne(id, query);
    },
    enabled: enabled && !!id,
    retry: false,
  });
};
