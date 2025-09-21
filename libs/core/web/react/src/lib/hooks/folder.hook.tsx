import { useQuery, useMutation } from '@tanstack/react-query';
import {
  CreateFolderDto,
  FolderFilterDto,
  FileMinViewDto,
  FileDetailsDto,
  GetOneFolderQueryDto,
} from '@keepcloud/commons/dtos';
import { FolderService, ApiError } from '../services';
import {
  ActiveFolder,
  DEFAULT_ACTIVE_FOLDER,
  activeFolderAtom,
  folderViewAtom,
} from '../atoms';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { StorageHelper } from '../helpers';
import { FOLDER_VIEW_KEY } from '@keepcloud/commons/constants';
import { useEffect } from 'react';
import { FolderViewMode } from '@keepcloud/commons/types';
import { useFileListUpdater } from './use-file-list-updater.hook';
import { FileHelper } from '@keepcloud/commons/helpers';
import { useInfiniteListQuery } from './use-infinite-list-query.hook';

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

interface CreateFolderProps {
  parentId: string;
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

export const useFolderViewMode = () => {
  const [view, setView] = useAtom(folderViewAtom);

  const setFolderViewMode = (newView: typeof view) => {
    setView(newView);
    StorageHelper.set(FOLDER_VIEW_KEY, newView);
  };

  return { view, setFolderViewMode };
};

export const useInitializeFolderViewMode = () => {
  const setView = useSetAtom(folderViewAtom);

  useEffect(() => {
    let savedView = StorageHelper.get<FolderViewMode>(FOLDER_VIEW_KEY);
    if (!savedView || !['grid', 'table'].includes(savedView))
      savedView = 'grid';

    setView(savedView);
    StorageHelper.set(FOLDER_VIEW_KEY, savedView);
  }, [setView]);
};

export const useCreateFolder = ({ parentId }: CreateFolderProps) => {
  const finalParentId = FileHelper.getValidParentId(parentId);

  const { insertItem } = useFileListUpdater(finalParentId);

  return useMutation<FileMinViewDto, ApiError, CreateFolderDto>({
    mutationFn: async (dto) => {
      if (FileHelper.isSystemFile(dto.parentId)) dto.parentId = undefined;
      return FolderService.create(dto);
    },

    onSuccess: (data: FileMinViewDto) => {
      insertItem(data, 'start');
    },
  });
};

export const useGetFolderChildren = ({
  id,
  filters = {} as FolderFilterDto,
  enabled = true,
}: GetChildrenProps) => {
  return useInfiniteListQuery<FileMinViewDto>({
    queryKey: ['folder', id, 'children'],
    listKey: id,
    enabled: enabled && !!id,
    fetchFn: async (page) =>
      FolderService.getChildren(id, { ...filters, page }),
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
