import {
  Info,
  Share2,
  Copy,
  Move,
  Trash2,
  Activity,
  TextCursorInput as RenameIcon,
  FolderOpen,
} from 'lucide-react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { MenuItem, ROUTE_PATH, useDialog } from '@keepcloud/web-core/react';
import { iconClassName, itemClassName } from './config';
import { useNavigate } from 'react-router';

export const useFolderMenuItems = (file: FileMinViewDto): MenuItem[] => {
  const navigate = useNavigate();
  const { openDialog } = useDialog();

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
      onClick: () => console.log(`Move ${file.name} to trash`),
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
