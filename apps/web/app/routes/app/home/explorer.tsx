import { Button } from '@keepcloud/web-core/react';
import { DataTableDemo } from '../../../components';
import {
  PlusIcon,
  UploadIcon,
  FolderPlusIcon,
  EllipsisVerticalIcon,
} from 'lucide-react';

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

const FolderIconOutline = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.6667 7.33337V11.3334C14.6667 14 14 14.6667 11.3333 14.6667H4.66668C2.00001 14.6667 1.33334 14 1.33334 11.3334V4.66671C1.33334 2.00004 2.00001 1.33337 4.66668 1.33337H5.66668C6.66668 1.33337 6.88668 1.62671 7.26668 2.13337L8.26668 3.46671C8.52001 3.80004 8.66668 4.00004 9.33334 4.00004H11.3333C14 4.00004 14.6667 4.66671 14.6667 7.33337Z"
      stroke="#FFCA28"
      strokeWidth="1.2"
      strokeMiterlimit="10"
    />
    <path
      d="M5.33334 1.33337H11.3333C12.6667 1.33337 13.3333 2.00004 13.3333 3.33337V4.25337"
      stroke="#FFCA28"
      strokeWidth="1.2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const folders = [
  'Wireframes',
  'Bank Statement',
  'Invoices',
  'Expenses',
  'Photo',
  'Income',
  'Code Base',
  'Deployment Report Files',
  'Project Plan',
  'Staff Meeting',
  'Payslips',
  '2022 Financial Report',
  'Wedding Photos',
  'Lectures',
  "University's Project",
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
        <h3 className="sticky top-0 z-[1] bg-background p-1.5 text-18-medium text-heading">
          Folders
        </h3>
        <div className="flex flex-col flex-wrap gap-3 sm:flex-row md:gap-8">
          {folders.map((folder) => (
            <Button
              key={folder}
              variant="secondary"
              className="flex h-[38px] w-full items-center justify-between gap-2 px-3 py-1 sm:w-[150px] md:w-[194px]"
            >
              <div className="flex max-w-[calc(100%-24px)] items-center gap-2 overflow-hidden">
                <FolderIconOutline />
                <p className="truncate text-left" title={folder}>
                  {folder}
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
        <h3 className="sticky top-0 z-[1] bg-background p-1.5 text-18-medium text-heading">
          Files
        </h3>
        <DataTableDemo />
      </div>
    </div>
  );
}
