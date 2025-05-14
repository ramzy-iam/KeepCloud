import * as React from 'react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { useGetMenuItems } from './use-get-menu';
import { MenuItem, useContextMenu } from '@keepcloud/web-core/react';

interface UseFileMenuProps {
  file: FileMinViewDto;
}

interface UseFileMenuReturn {
  FileMenu: React.FC<{ children: React.ReactNode }>;
  openMenu: (event?: React.MouseEvent) => void;
  closeMenu: () => void;
  isMenuOpen: boolean;
}

export function useFileMenu({ file }: UseFileMenuProps): UseFileMenuReturn {
  const fileName = file.name;

  const menuItems: MenuItem[] = useGetMenuItems({ file });

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
