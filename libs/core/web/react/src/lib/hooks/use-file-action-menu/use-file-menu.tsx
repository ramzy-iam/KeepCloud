import {
  Info,
  ExternalLink,
  Share2,
  Link,
  UserCog,
  Download,
  Copy,
  Move,
  Trash2,
  Star,
  Pin,
  Eye,
  Activity,
  TextCursorInput as RenameIcon,
  Eye as PreviewIcon,
  History,
} from 'lucide-react';
import { MenuItem, ROUTE_PATH } from '@keepcloud/web-core/react';
import { iconClassName, itemClassName } from './config';
import { useNavigate } from 'react-router';
import { FileMinViewDto } from '@keepcloud/commons/dtos';

export const useFileMenuItems = (file: {
  id: string;
  name: string;
}): MenuItem[] => [
  {
    label: 'Preview',
    icon: <PreviewIcon className={iconClassName} />,
    onClick: () => console.log(`Preview ${file.name}`),
    className: itemClassName,
  },
  {
    label: 'Info',
    icon: <Info className={iconClassName} />,
    onClick: () => console.log(`View info for ${file.name}`),
    className: itemClassName,
  },
  {
    label: 'Open in',
    icon: <ExternalLink className={iconClassName} />,
    onClick: () => console.log(`Open ${file.name} in...`),
    className: itemClassName,
  },
  {
    label: 'Share',
    icon: <Share2 className={iconClassName} />,
    onClick: () => console.log(`Share ${file.name}`),
    className: itemClassName,
  },
  {
    label: 'Copy link',
    icon: <Link className={iconClassName} />,
    onClick: () => console.log(`Copy link for ${file.name}`),
    className: itemClassName,
  },
  {
    label: 'Manage permissions',
    icon: <UserCog className={iconClassName} />,
    onClick: () => console.log(`Manage permissions for ${file.name}`),
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
    onClick: () => console.log(`Rename ${file.name}`),
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
    label: 'Move to Trash',
    icon: <Trash2 className={iconClassName} />,
    onClick: () => console.log(`Move ${file.name} to Trash`),
    className: itemClassName,
    separatorAfter: true,
  },
  {
    label: 'Star',
    icon: <Star className={iconClassName} />,
    onClick: () => console.log(`Star ${file.name}`),
    className: itemClassName,
  },
  {
    label: 'Pin to KeepCloud',
    icon: <Pin className={iconClassName} />,
    onClick: () => console.log(`Pin ${file.name} to KeepCloud`),
    className: itemClassName,
  },
  {
    label: 'Show pinned items',
    icon: <Eye className={iconClassName} />,
    onClick: () => console.log(`Show pinned items for ${file.name}`),
    className: itemClassName,
  },
  {
    label: 'Activity',
    icon: <Activity className={iconClassName} />,
    onClick: () => console.log(`View activity for ${file.name}`),
    className: itemClassName,
  },
];

export const useTrashedFileMenuItems = (file: FileMinViewDto): MenuItem[] => {
  const navigate = useNavigate();

  return [
    {
      label: 'Restore',
      icon: <History className={iconClassName} />,
      onClick: () => navigate(ROUTE_PATH.folderDetails(file.id)),
      className: itemClassName,
    },

    {
      label: 'Delete permanently',
      icon: (
        <Trash2 className="mr-2 h-4 w-4 text-error-500 hover:text-error-500 dark:hover:text-neutral-200" />
      ),
      onClick: () => console.log(`View info for ${file.name}`),
      className: itemClassName,
    },
  ];
};
