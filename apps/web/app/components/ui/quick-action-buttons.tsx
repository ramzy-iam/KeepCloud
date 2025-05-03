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

interface IActionButton {
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >;
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

const ActionButton = ({ action }: ActionButtonProps) => {
  const { menuItems, label } = action;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-wrap justify-start gap-16 bg-background py-6">
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger>
          <span
            data-active={isMenuOpen}
            onClick={(event) => {
              event.stopPropagation();
            }}
            className="group flex w-[100px] cursor-pointer flex-col items-center gap-2 rounded-[8px] border border-stroke-500 p-3 text-heading hover:border-primary hover:bg-primary/5 data-[active=true]:border-primary! md:w-[156px] md:items-start dark:border-neutral-600 dark:hover:border-primary"
          >
            <action.icon className="text-primary dark:group-hover:text-white-light dark:group-data-[active=true]:text-white-light" />
            <span className="text-14 group-hover:text-primary group-data-[active=true]:text-primary dark:group-hover:text-white-light dark:group-data-[active=true]:text-white-light">
              {label}
            </span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={cn('max-w-[285px] min-w-[200px] p-2')}>
          {menuItems.map(renderMenuItem)}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const QuickActionButtons = () => {
  return (
    <div className="flex flex-wrap justify-start gap-8 bg-background py-6 md:gap-16">
      {actions.map((action) => (
        <ActionButton key={action.label} action={action} />
      ))}
    </div>
  );
};
