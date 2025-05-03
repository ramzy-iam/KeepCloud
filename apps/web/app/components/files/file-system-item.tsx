import { Button, ROUTE_PATH, cn, useFileMenu } from '@keepcloud/web-core/react';
import { FileTextIcon, EllipsisVerticalIcon } from 'lucide-react';
import { File } from '@keepcloud/commons/types';
import { FolderIconOutline } from '../ui';
import { useNavigate } from 'react-router';

interface FileSystemItemProps {
  file: File;
  className?: string;
}

export const FileSystemItem = ({ file, className }: FileSystemItemProps) => {
  const { FileMenu } = useFileMenu({ file });
  const isFolder = file.fileType === 'folder';
  const navigate = useNavigate();
  const url = ROUTE_PATH.folderDetails(file.id);

  const handleClick = () => {
    if (isFolder) {
      navigate(url);
    }
  };

  return (
    <Button
      variant="secondary"
      className={cn(
        'flex h-[38px] w-full items-center justify-between gap-2 px-3 py-1 sm:w-[150px] md:w-[194px]',
        className,
      )}
      onClick={handleClick}
    >
      <div className="flex max-w-[calc(100%-24px)] items-center gap-2 overflow-hidden">
        {isFolder ? (
          <FolderIconOutline />
        ) : (
          <FileTextIcon className="h-4 w-4 text-app-accent" />
        )}
        <p
          className="truncate text-left text-14-medium text-secondary-foreground"
          title={file.name}
        >
          {file.name}
        </p>
      </div>
      <FileMenu>
        <Button
          asChild
          variant={'text'}
          size={'icon'}
          className="size-[24px] rounded-full p-1 hover:bg-stroke-200 dark:hover:bg-white/5"
          aria-label={`More options for ${file.name}`}
        >
          <EllipsisVerticalIcon className="h-4 w-4" />
        </Button>
      </FileMenu>
    </Button>
  );
};
