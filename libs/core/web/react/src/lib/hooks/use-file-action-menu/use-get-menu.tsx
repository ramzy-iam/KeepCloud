import { FileMinViewDto, TrashedFileDto } from '@keepcloud/commons/dtos';
import { MenuItem } from '@keepcloud/web-core/react';
import { useFileMenuItems, useTrashedFileMenuItems } from './use-file-menu';
import {
  useFolderMenuItems,
  useTrashedFolderMenuItems,
} from './use-folder-menu';

interface UseGetMenuProps {
  file: FileMinViewDto;
}

export const useGetMenuItems = ({ file }: UseGetMenuProps): MenuItem[] => {
  if (file.isFolder) {
    return useFolderMenuItems(file);
  }
  return useFileMenuItems(file);
};

export const useGetMenuTrashedItems = ({
  file,
}: UseGetMenuProps): MenuItem[] => {
  if (file.isFolder) {
    return useTrashedFolderMenuItems(file);
  }
  return useTrashedFileMenuItems(file);
};
