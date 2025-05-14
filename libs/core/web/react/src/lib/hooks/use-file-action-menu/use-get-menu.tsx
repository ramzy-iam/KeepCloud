import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { MenuItem } from '@keepcloud/web-core/react';
import { useFileMenuItems } from './use-file-menu';
import { useFolderMenuItems } from './use-folder-menu';

interface UseGetMenuProps {
  file: FileMinViewDto;
}

export const useGetMenuItems = ({ file }: UseGetMenuProps): MenuItem[] => {
  if (file.contentType === 'folder') {
    return useFolderMenuItems(file);
  }
  return useFileMenuItems(file);
};
