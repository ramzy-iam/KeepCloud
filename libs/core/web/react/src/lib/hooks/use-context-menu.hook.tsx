import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../components';
import { cn } from '../helpers';

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  separatorBefore?: boolean;
  separatorAfter?: boolean;
  disabled?: boolean;
  subItems?: MenuItem[];
}

interface UseContextMenuProps {
  menuItems: MenuItem[];
  label?: string;
  align?: 'start' | 'end' | 'center';
  contentClassName?: string;
  enableRightClick?: boolean;
}

interface ContextMenuProps {
  children: React.ReactNode;
  className?: string;
}

interface UseContextMenuReturn {
  ContextMenu: React.FC<ContextMenuProps>;
  openMenu: (event?: React.MouseEvent) => void;
  closeMenu: () => void;
  isMenuOpen: boolean;
}

export const renderMenuItem = (item: MenuItem, index: number) => {
  if (item.subItems && item.subItems.length > 0) {
    return (
      <DropdownMenuSub key={index}>
        <DropdownMenuSubTrigger
          className={cn(
            'flex cursor-pointer items-center py-2',
            item.className,
          )}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          <span>{item.label}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          {item.subItems.map((subItem, subIndex) =>
            renderMenuItem(subItem, subIndex),
          )}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return (
    <>
      {item.separatorBefore && <DropdownMenuSeparator />}
      <DropdownMenuItem
        className={cn('flex cursor-pointer items-center py-2', item.className)}
        onClick={(e) => {
          e.stopPropagation();
          item.onClick?.();
        }}
        disabled={item.disabled}
      >
        {item.icon && <span className="mr-2">{item.icon}</span>}
        <span>{item.label}</span>
      </DropdownMenuItem>
      {item.separatorAfter && <DropdownMenuSeparator />}
    </>
  );
};

export function useContextMenu({
  menuItems,
  label,
  align = 'end',
  contentClassName,
  enableRightClick = false,
}: UseContextMenuProps): UseContextMenuReturn {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement | null>(null);

  const openMenu = () => {
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  React.useEffect(() => {
    if (!enableRightClick || !triggerRef.current) return;

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      openMenu();
    };

    const triggerElement = triggerRef.current;
    triggerElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
      triggerElement.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [enableRightClick]);

  const ContextMenu: React.FC<ContextMenuProps> = ({ children, className }) => (
    <div ref={triggerRef} className={cn(className)}>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className={cn('w-[285px] p-2', contentClassName)}
        >
          {label && (
            <DropdownMenuLabel className="mb-3 text-14-medium">
              {label}
            </DropdownMenuLabel>
          )}
          {menuItems.map((item, index) => (
            <React.Fragment key={item.label}>
              {renderMenuItem(item, index)}
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return {
    ContextMenu,
    openMenu,
    closeMenu,
    isMenuOpen,
  };
}
