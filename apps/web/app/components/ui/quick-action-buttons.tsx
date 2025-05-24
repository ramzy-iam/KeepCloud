import React, { useRef } from 'react';
import {
  FileUp,
  FolderPlus,
  FolderUp,
  PlusIcon,
  UploadIcon,
} from 'lucide-react';
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
import { FileHelper } from '@keepcloud/commons/helpers';
import { FileUploadHandler } from './file-upload-handler';

interface IActionButton {
  icon: React.ComponentType<any>;
  label: string;
  menuItems: MenuItem[];
}

interface QuickActionButtonsProps {
  className?: string;
  keysToInvalidate?: string[][];
  maxFileSize?: number;
}

const iconClassName = 'mr-2 h-4 w-4 text-neutral-300';
const itemClassName =
  'flex cursor-pointer items-center py-2 text-neutral-300 hover:bg-foreground hover:text-neutral-300 dark:text-neutral-200';

const ActionButton = ({ action }: { action: IActionButton }) => {
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

export const QuickActionButtons = ({
  className,
  keysToInvalidate = [],
  maxFileSize = FileHelper.convertToBytes(10, 'MB'),
}: QuickActionButtonsProps) => {
  const { openDialog } = useDialog();
  const { activeFolder } = useGetActiveFolder();

  const uploadHandlerRef = useRef<{ triggerFileInput: () => void }>({
    triggerFileInput: () => {},
  });

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
          onClick: () => uploadHandlerRef.current.triggerFileInput(),
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
        'flex flex-wrap justify-start gap-8 bg-background md:gap-16',
        className,
      )}
    >
      <FileUploadHandler
        uploadHandlerRef={uploadHandlerRef.current}
        maxFileSize={maxFileSize}
        keysToInvalidate={keysToInvalidate}
      />
      {actions.map((action) => (
        <ActionButton
          key={`${action.label}-${action.icon.name}`}
          action={action}
        />
      ))}
    </div>
  );
};
