import {
  Info,
  Trash2,
  TextCursorInput as RenameIcon,
  FolderOpen,
  History,
} from 'lucide-react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { MenuItem, useDialog, useMoveToTrash, useRestoreResource } from '../';
import { iconClassName, itemClassName } from './config';
import { useNavigate } from 'react-router';
import { FileHelper } from '@keepcloud/commons/helpers';
import { ROUTE_PATH } from '../../constants';
import { cn } from '../../helpers';

export const useFolderMenuItems = (file: FileMinViewDto): MenuItem[] => {
  const navigate = useNavigate();
  const { openDialog } = useDialog();

  const moveToTrash = useMoveToTrash({
    parentId: FileHelper.getValidParentId(file.parentId),
  });

  return [
    {
      label: 'Open',
      icon: <FolderOpen className={iconClassName} />,
      onClick: () => navigate(ROUTE_PATH.folderDetails(file.id)),
      className: itemClassName,
    },
    {
      label: 'Info',
      icon: <Info className={iconClassName} />,
      onClick: () => {
        openDialog({
          type: 'fileInfo',
          item: file,
        });
      },
      className: itemClassName,
    },
    {
      label: 'Rename',
      icon: <RenameIcon className={iconClassName} />,
      onClick: () =>
        openDialog({
          type: 'rename',
          item: file,
        }),
      className: itemClassName,
    },

    {
      label: 'Move to trash',
      icon: <Trash2 className={iconClassName} />,
      onClick: () => {
        moveToTrash.mutate(file.id);
      },
      className: itemClassName,
      separatorAfter: true,
    },
  ];
};

export const useTrashedFolderMenuItems = (file: FileMinViewDto): MenuItem[] => {
  const { openDialog } = useDialog();

  const restoreFolder = useRestoreResource();

  return [
    {
      label: 'Restore',
      icon: <History className={iconClassName} />,
      onClick: () => {
        restoreFolder.mutate(file.id);
      },
      className: itemClassName,
      disabled: restoreFolder.isPending,
    },
    {
      label: 'Delete permanently',
      icon: (
        <Trash2 className="mr-2 h-4 w-4 text-error-500 hover:text-error-500 dark:hover:text-neutral-200" />
      ),
      onClick: () => {
        openDialog({
          type: 'deletePermanently',
          item: file,
        });
      },
      className: cn(itemClassName, 'text-error-500! hover:text-error-500!'),
    },
  ];
};
