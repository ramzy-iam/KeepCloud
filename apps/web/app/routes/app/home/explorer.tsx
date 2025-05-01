import { TableView, GridView } from '../../../components';
import { PlusIcon, UploadIcon, FolderPlusIcon } from 'lucide-react';
import { files, folders } from '@keepcloud/commons/types';

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
        <GridView data={folders} />
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="sticky -top-[1px] z-[1] bg-background p-1.5 text-18-medium text-heading">
          Suggested Files
        </h3>
        <TableView data={files} />
      </div>
    </div>
  );
}
