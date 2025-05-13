import { FileSystemItem } from './file-system-item';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { Skeleton } from '@keepcloud/web-core/react';

interface GridViewProps {
  data: FileMinViewDto[];
  onlyFolders?: boolean;
  group?: boolean;
  isLoading?: boolean;
}

export const GridView = ({
  data,
  onlyFolders = true,
  group = false,
  isLoading = false,
}: GridViewProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 sm:grid sm:grid-cols-5 sm:gap-8">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-[38px] min-w-[100px] rounded-md px-3 py-1"
          />
        ))}
      </div>
    );
  }

  let itemsToDisplay: FileMinViewDto[] = onlyFolders
    ? data.filter((item) => !item.format)
    : data;

  if (group) {
    const files = data.filter((item) => item.format);
    const folders = data.filter((item) => !item.format);

    return (
      <div className="flex flex-col gap-3">
        {folders.length > 0 && (
          <div>
            <h4 className="mb-2 text-16-medium text-heading">Folders</h4>
            <div className="flex flex-wrap gap-3 sm:flex-row md:gap-8">
              {folders.map((item) => (
                <FileSystemItem key={item.id} file={item} />
              ))}
            </div>
          </div>
        )}
        {files.length > 0 && (
          <div>
            <h4 className="mb-2 text-16-medium text-heading">Files</h4>
            <div className="flex flex-wrap gap-3 sm:flex-row md:gap-8">
              {files.map((item) => (
                <FileSystemItem key={item.id} file={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-wrap gap-3 sm:flex-row md:gap-8">
      {itemsToDisplay.map((item) => (
        <FileSystemItem key={item.id} file={item} />
      ))}
    </div>
  );
};
