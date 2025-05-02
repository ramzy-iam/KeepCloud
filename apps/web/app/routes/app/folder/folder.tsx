import { Button } from '@keepcloud/web-core/react';
import { FolderIconOutline } from '../../../components';
import { EllipsisVerticalIcon } from 'lucide-react';

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

export default function FolderComponent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="sticky top-0 z-[1] bg-background p-1.5 text-18-medium text-heading">
          My Storage
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
    </div>
  );
}
