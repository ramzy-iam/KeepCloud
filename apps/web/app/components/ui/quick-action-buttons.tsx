import {
  FileUp,
  FolderPlus,
  FolderUp,
  LucideProps,
  PlusIcon,
  UploadIcon,
} from 'lucide-react';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  MenuItem,
  cn,
  renderMenuItem,
  useDialog,
  useGetActiveFolder,
} from '@keepcloud/web-core/react';

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

const ActionButton = ({ action }: ActionButtonProps) => {
  const { menuItems, label, icon: Icon } = action;

  return (
    <div className="flex flex-wrap justify-start gap-16 bg-background py-6">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <span className="group flex w-[100px] cursor-pointer flex-col items-center gap-2 rounded-[8px] border border-stroke-500 p-3 text-heading hover:border-primary hover:bg-primary/5 md:w-[156px] md:items-start dark:border-neutral-600 dark:hover:border-primary">
            <Icon className="text-primary" />
            <span className="text-14">{label}</span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={cn('max-w-[285px] min-w-[200px] p-2')}>
          {menuItems.map((item, index) => (
            <React.Fragment key={`${item.label}-${index}`}>
              {renderMenuItem(item, index)}
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const QuickActionButtons = ({ className }: { className?: string }) => {
  const { openDialog } = useDialog();
  const { activeFolder } = useGetActiveFolder();

  const actions: IActionButton[] = [
    {
      icon: PlusIcon,
      label: 'New',
      menuItems: [
        {
          label: 'Folder',
          icon: <FolderPlus className={iconClassName} />,
          className: itemClassName,
          onClick: () =>
            openDialog({
              type: 'createFolder',
              folderId: activeFolder?.id,
            }),
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
          className: itemClassName,
          onClick: () => console.log('Import a file clicked'),
        },
        {
          label: 'Import a folder',
          icon: <FolderUp absoluteStrokeWidth className={iconClassName} />,
          className: itemClassName,
          onClick: () => console.log('Import a folder clicked'),
        },
      ],
    },
  ];

  return (
    <div
      className={cn(
        'flex flex-wrap justify-start gap-8 bg-background py-6 md:gap-16',
        className,
      )}
    >
      {actions.map((action) => (
        <ActionButton
          key={`${action.label}-${action.icon.name}`}
          action={action}
        />
      ))}
    </div>
  );
};
