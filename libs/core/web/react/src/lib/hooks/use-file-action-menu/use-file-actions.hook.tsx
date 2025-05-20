import * as React from 'react';
import { FileMinViewDto, TrashedFileDto } from '@keepcloud/commons/dtos';
import { useGetMenuItems, useGetMenuTrashedItems } from './use-get-menu';
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

export const useFileMenu = ({ file }: UseFileMenuProps): UseFileMenuReturn => {
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
};

export const useTrashedFileMenu = (
  file: FileMinViewDto,
): {
  FileMenu: React.FC<{ children: React.ReactNode }>;
  openMenu: (event?: React.MouseEvent) => void;
  closeMenu: () => void;
  isMenuOpen: boolean;
} => {
  const menuItems = useGetMenuTrashedItems({ file });

  const { ContextMenu, openMenu, closeMenu, isMenuOpen } = useContextMenu({
    menuItems,
    label: file.name,
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
};
