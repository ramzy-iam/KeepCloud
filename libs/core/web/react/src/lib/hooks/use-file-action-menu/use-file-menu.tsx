import {
  Info,
  Download,
  Trash2,
  TextCursorInput as RenameIcon,
  Eye as PreviewIcon,
  History,
} from 'lucide-react';
import { MenuItem, useDialog, useMoveToTrash, useRestoreResource } from '../';
import { iconClassName, itemClassName } from './config';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { cn } from '../../helpers';
import { FileHelper } from '@keepcloud/commons/helpers';

export const useFileMenuItems = (file: FileMinViewDto): MenuItem[] => {
  const { openDialog } = useDialog();

  const moveToTrash = useMoveToTrash({
    parentId: FileHelper.getValidParentId(file.parentId),
  });
  return [
    {
      label: 'Preview',
      icon: <PreviewIcon className={iconClassName} />,
      onClick: () => {
        openDialog({
          type: 'previewFile',
          item: file,
        });
      },
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
      label: 'Download',
      icon: <Download className={iconClassName} />,
      onClick: () => console.log(`Download ${file.name}`),
      className: itemClassName,
      separatorAfter: true,
    },
    {
      label: 'Rename',
      icon: <RenameIcon className={iconClassName} />,
      onClick: () => {
        openDialog({
          type: 'rename',
          item: file,
        });
      },
      className: itemClassName,
    },

    {
      label: 'Move to Trash',
      icon: <Trash2 className={iconClassName} />,
      onClick: () => {
        moveToTrash.mutate(file.id);
      },
      className: itemClassName,
    },
  ];
};

export const useTrashedFileMenuItems = (file: FileMinViewDto): MenuItem[] => {
  const { openDialog } = useDialog();
  const restoreFile = useRestoreResource();

  return [
    {
      label: 'Restore',
      icon: <History className={iconClassName} />,
      onClick: () => {
        restoreFile.mutate(file.id);
      },
      className: itemClassName,
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
