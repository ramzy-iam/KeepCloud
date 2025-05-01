import { Button } from '@keepcloud/web-core/react';
import { DataTableDemo, FolderIconOutline } from '../../../components';
import {
  PlusIcon,
  UploadIcon,
  FolderPlusIcon,
  EllipsisVerticalIcon,
} from 'lucide-react';
import { File, folders } from '@keepcloud/commons/types';

const actions = [
  {
    icon: PlusIcon,
    label: 'New',
  },
  {
    icon: UploadIcon,
    label: 'Upload or drop',
  },
  {
    label: 'New Folder',
    icon: FolderPlusIcon,
  },
];

export default function ExplorerComponent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap justify-around gap-2 py-6 md:flex-row md:justify-start md:gap-4">
        {actions.map((action) => (
          <button
            key={action.label}
            className="group flex w-[100px] cursor-pointer flex-col items-center gap-2 rounded-[8px] border border-stroke-500 p-3 text-heading hover:border-primary hover:bg-primary/5 md:w-[156px] md:items-start dark:border-neutral-600 dark:hover:border-primary"
          >
            <action.icon className="text-primary dark:group-hover:text-white-light" />
            <span className="text-14 group-hover:text-primary dark:group-hover:text-white-light">
              {action.label}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="sticky -top-[1px] z-[1] bg-background p-1.5 text-18-medium text-heading">
          Suggested Folders
        </h3>
        <div className="flex flex-col flex-wrap gap-3 sm:flex-row md:gap-8">
          {folders.slice(0, 10).map((folder) => (
            <Button
              key={folder.id}
              variant="secondary"
              className="flex h-[38px] w-full items-center justify-between gap-2 px-3 py-1 sm:w-[150px] md:w-[194px]"
            >
              <div className="flex max-w-[calc(100%-24px)] items-center gap-2 overflow-hidden">
                <FolderIconOutline />
                <p className="truncate text-left" title={folder.name}>
                  {folder.name}
                </p>
              </div>
              <span
                onClick={(event) => {
                  event.stopPropagation();
                  console.log('Clicked on ellipsis icon!');
                }}
                className="rounded-full p-1 hover:bg-stroke-200 dark:hover:bg-white/5"
              >
                <EllipsisVerticalIcon />
              </span>
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="sticky -top-[1px] z-[1] bg-background p-1.5 text-18-medium text-heading">
          Suggested Files
        </h3>
        <DataTableDemo />
      </div>
    </div>
  );
}
