import {
  Info,
  Share2,
  Copy,
  Move,
  Trash2,
  Activity,
  TextCursorInput as RenameIcon,
  FolderOpen,
  History,
} from 'lucide-react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import {
  MenuItem,
  ROUTE_PATH,
  cn,
  useDialog,
  useMoveToTrash,
  useRestoreResource,
} from '@keepcloud/web-core/react';
import { iconClassName, itemClassName } from './config';
import { useNavigate } from 'react-router';
import { FileHelper } from '@keepcloud/commons/helpers';

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
      onClick: () => console.log(`View info for ${file.name}`),
      className: itemClassName,
    },
    {
      label: 'Share',
      icon: <Share2 className={iconClassName} />,
      onClick: () => console.log(`Share ${file.name}`),
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
      label: 'Copy',
      icon: <Copy className={iconClassName} />,
      onClick: () => console.log(`Copy ${file.name}`),
      className: itemClassName,
    },
    {
      label: 'Move',
      icon: <Move className={iconClassName} />,
      onClick: () => console.log(`Move ${file.name}`),
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
    {
      label: 'Activity',
      icon: <Activity className={iconClassName} />,
      onClick: () => console.log(`View activity for ${file.name}`),
      className: itemClassName,
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
