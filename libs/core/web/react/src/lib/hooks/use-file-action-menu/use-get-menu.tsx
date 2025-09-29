import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { MenuItem } from '../../components';
import { useFileMenuItems, useTrashedFileMenuItems } from './use-file-menu';
import {
  useFolderMenuItems,
  useTrashedFolderMenuItems,
} from './use-folder-menu';

interface UseGetMenuProps {
  file: FileMinViewDto;
}

export const useGetMenuItems = ({ file }: UseGetMenuProps): MenuItem[] => {
  const folderMenu = useFolderMenuItems(file);
  const fileMenu = useFileMenuItems(file);

  return file.isFolder ? folderMenu : fileMenu;
};

export const useGetMenuTrashedItems = ({
  file,
}: UseGetMenuProps): MenuItem[] => {
  const trashedFolderMenu = useTrashedFolderMenuItems(file);
  const trashedFileMenu = useTrashedFileMenuItems(file);

  return file.isFolder ? trashedFolderMenu : trashedFileMenu;
};
