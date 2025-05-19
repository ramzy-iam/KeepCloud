import React, { useState } from 'react';

import {
  MenuItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  cn,
  renderMenuItem,
} from '@keepcloud/web-core/react';
import {
  FileUp,
  FolderPlus,
  FolderUp,
  LucideProps,
  PlusIcon,
  UploadIcon,
} from 'lucide-react';
import { AddFolderFormDialog } from '../forms';

interface IActionButton {
  icon: React.ComponentType<LucideProps>;
  label: string;
  menuItems: MenuItem[];
}

interface ActionButtonProps {
  action: IActionButton;
}

const iconClassName =
  'mr-2 h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200';
const itemClassName =
  'flex cursor-pointer items-center stroke-neutral-300 py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:stroke-200 dark:text-neutral-200 dark:hover:text-neutral-200';

const actions: IActionButton[] = [
  {
    icon: PlusIcon,
    label: 'New',

    menuItems: [
      {
        label: 'Folder',
        icon: <FolderPlus className={iconClassName} />,
        onClick: () => console.log(`add folder`),
        className: itemClassName,
      },
    ],
  },
  {
    icon: UploadIcon,
    label: 'Upload',

    menuItems: [
      {
        label: 'Import a file',
        icon: <FileUp absoluteStrokeWidth className={iconClassName} />,
        onClick: () => console.log(`add folder`),
        className: itemClassName,
      },
      {
        label: 'Import a folder',
        icon: <FolderUp absoluteStrokeWidth className={iconClassName} />,
        onClick: () => console.log(`add folder`),
        className: itemClassName,
      },
    ],
  },
];

const dialogRegistry: Record<
  string,
  React.FC<{ open: boolean; onOpenChange: (v: boolean) => void }>
> = {
  Folder: AddFolderFormDialog,
};

const ActionButton = ({ action }: ActionButtonProps) => {
  const { menuItems, label } = action;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDialogKey, setActiveDialogKey] = useState<string | null>(null);

  const handleDialogClose = () => setActiveDialogKey(null);
  const ActiveDialogComponent = activeDialogKey
    ? dialogRegistry[activeDialogKey]
    : null;

  return (
    <>
      <div className="flex flex-wrap justify-start gap-16 bg-background py-6">
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger>
            <span
              data-active={isMenuOpen}
              onClick={(e) => e.stopPropagation()}
              className="group flex w-[100px] cursor-pointer flex-col items-center gap-2 rounded-[8px] border border-stroke-500 p-3 text-heading hover:border-primary hover:bg-primary/5 data-[active=true]:border-primary! md:w-[156px] md:items-start dark:border-neutral-600 dark:hover:border-primary"
            >
              <action.icon className="text-primary" />
              <span className="text-14">{label}</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={cn('max-w-[285px] min-w-[200px] p-2')}
          >
            {menuItems.map((item, index) => (
              <React.Fragment key={item.label}>
                {renderMenuItem(
                  {
                    ...item,
                    onClick: () => {
                      setIsMenuOpen(false);
                      setActiveDialogKey(item.label);
                    },
                  },
                  index,
                )}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {ActiveDialogComponent && (
        <ActiveDialogComponent open={true} onOpenChange={handleDialogClose} />
      )}
    </>
  );
};

export const QuickActionButtons = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'flex flex-wrap justify-start gap-8 bg-background py-6 md:gap-16',
        className,
      )}
    >
      {actions.map((action) => (
        <ActionButton key={action.label} action={action} />
      ))}
    </div>
  );
};
