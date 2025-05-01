import * as React from 'react';
import { useContextMenu } from './use-context-menu.hook';
import {
  ChevronRight,
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
} from 'lucide-react';
import { File } from '@keepcloud/commons/types';
import { cn } from '../helpers';

interface UseFileMenuProps {
  file: File;
}

interface UseFileMenuReturn {
  FileMenu: React.FC<{ children: React.ReactNode }>;
  openMenu: (event?: React.MouseEvent) => void;
  closeMenu: () => void;
  isMenuOpen: boolean;
}

export function useFileMenu({ file }: UseFileMenuProps): UseFileMenuReturn {
  const fileName = file.name;
  const iconClassName =
    'mr-2 h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200';
  const itemClassName =
    'flex cursor-pointer items-center stroke-neutral-300 py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:stroke-200 dark:text-neutral-200 dark:hover:text-neutral-200';
  const menuItems = [
    {
      label: 'Info',
      icon: <Info className={iconClassName} />,
      onClick: () => console.log(`View info for ${fileName}`),
      className: itemClassName,
      suffix: (
        <ChevronRight className="ml-auto h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
      ),
    },
    {
      label: 'Open in',
      icon: <ExternalLink className={iconClassName} />,
      onClick: () => console.log(`Open ${fileName} in...`),
      className: itemClassName,
      suffix: (
        <ChevronRight className="ml-auto h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
      ),
    },
    {
      label: 'Share',
      icon: <Share2 className={iconClassName} />,
      onClick: () => console.log(`Share ${fileName}`),
      className: itemClassName,
    },
    {
      label: 'Copy link',
      icon: <Link className={iconClassName} />,
      onClick: () => console.log(`Copy link for ${fileName}`),
      className: itemClassName,
    },
    {
      label: 'Manage permissions',
      icon: <UserCog className={iconClassName} />,
      onClick: () => console.log(`Manage permissions for ${fileName}`),
      className: itemClassName,
    },
    {
      label: 'Download',
      icon: <Download className={iconClassName} />,
      onClick: () => console.log(`Download ${fileName}`),
      className: itemClassName,
      separatorAfter: true,
    },
    {
      label: 'Rename',
      icon: <RenameIcon className={iconClassName} />,
      onClick: () => console.log(`Rename ${fileName}`),
      className: itemClassName,
    },

    {
      label: 'Copy',
      icon: <Copy className={iconClassName} />,
      onClick: () => console.log(`Copy ${fileName}`),
      className:
        'flex cursor-pointer items-center py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:text-neutral-200 dark:hover:text-neutral-200',
    },
    {
      label: 'Move',
      icon: <Move className={iconClassName} />,
      onClick: () => console.log(`Move ${fileName}`),
      className: itemClassName,
    },
    {
      label: 'Delete',
      icon: (
        <Trash2 className="mr-2 h-4 w-4 text-error-500 hover:text-error-500 dark:hover:text-neutral-200" />
      ),
      onClick: () => console.log(`Delete ${fileName}`),
      className: cn(
        'flex cursor-pointer items-center py-2 text-error-500 hover:text-error-500!',
      ),
      separatorAfter: true,
    },
    {
      label: 'Star',
      icon: <Star className={iconClassName} />,
      onClick: () => console.log(`Star ${fileName}`),
      className: itemClassName,
    },
    {
      label: 'Pin to KeepCloud',
      icon: <Pin className={iconClassName} />,
      onClick: () => console.log(`Pin ${fileName} to KeepCloud`),
      className: itemClassName,
    },
    {
      label: 'Show pinned items',
      icon: <Eye className={iconClassName} />,
      onClick: () => console.log(`Show pinned items for ${fileName}`),
      className: itemClassName,
    },
    {
      label: 'Activity',
      icon: <Activity className={iconClassName} />,
      onClick: () => console.log(`View activity for ${fileName}`),
      className: itemClassName,
      suffix: (
        <ChevronRight className="ml-auto h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
      ),
    },
  ];

  const { ContextMenu, openMenu, closeMenu, isMenuOpen } = useContextMenu({
    menuItems,
    label: fileName,
    align: 'end',
    enableRightClick: true,
  });

  const FileMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ContextMenu>{children}</ContextMenu>
  );

  return {
    FileMenu,
    openMenu,
    closeMenu,
    isMenuOpen,
  };
}
