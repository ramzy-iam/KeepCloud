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
} from 'lucide-react';
import { File } from '@keepcloud/commons/types';
import { cn } from '../helpers';

const RenameIcon = () => (
  <svg
    width="18"
    height="19"
    viewBox="0 0 18 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.75 5.75012H3.9C3.05992 5.75012 2.63988 5.75012 2.31901 5.91361C2.03677 6.05742 1.8073 6.28689 1.66349 6.56914C1.5 6.89 1.5 7.31004 1.5 8.15012V10.8501C1.5 11.6902 1.5 12.1102 1.66349 12.4311C1.8073 12.7134 2.03677 12.9428 2.31901 13.0866C2.63988 13.2501 3.05992 13.2501 3.9 13.2501H9.75M12.75 5.75012H14.1C14.9401 5.75012 15.3601 5.75012 15.681 5.91361C15.9632 6.05742 16.1927 6.28689 16.3365 6.56914C16.5 6.89 16.5 7.31004 16.5 8.15012V10.8501C16.5 11.6902 16.5 12.1102 16.3365 12.4311C16.1927 12.7134 15.9632 12.9428 15.681 13.0866C15.3601 13.2501 14.9401 13.2501 14.1 13.2501H12.75M12.75 16.2501L12.75 2.75012M14.625 2.75013L10.875 2.75012M14.625 16.2501L10.875 16.2501"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
      icon: (
        <span className="stroke-neutral-300! hover:stroke-neutral-300! dark:stroke-200 dark:hover:stroke-neutral-200">
          <RenameIcon />
        </span>
      ),
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
