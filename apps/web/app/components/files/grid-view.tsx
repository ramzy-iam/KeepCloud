import { Button, cn, Skeleton } from '@keepcloud/web-core/react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { FolderEmpty } from '../ui';
import { FileSystemItem } from './file-system-item';

interface GridViewProps {
  data: FileMinViewDto[];
  onlyFolders?: boolean;
  group?: boolean;
  isLoading?: boolean;
  noDataComponent?: React.ReactNode;
  CustomFileSystemItem?: React.FC<{
    file: FileMinViewDto;
    selectionMode?: boolean;
    isSelected?: boolean;
    onSelectionChange?: (
      id: string,
      selected: boolean,
      addToSelection?: boolean,
    ) => void;
  }>;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  selectionMode?: boolean;
  selectedItems?: Set<string>;
  onSelectionChange?: (
    id: string,
    selected: boolean,
    addToSelection?: boolean,
  ) => void;
}

export const GridView = ({
  data,
  onlyFolders = false,
  group = false,
  isLoading = false,
  noDataComponent = <FolderEmpty />,
  CustomFileSystemItem = FileSystemItem,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  selectionMode = false,
  selectedItems = new Set(),
  onSelectionChange,
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

  const itemsToDisplay: FileMinViewDto[] = onlyFolders
    ? data.filter((item) => !item.format)
    : data;

  const isFolderEmpty = itemsToDisplay.length === 0;

  if (group) {
    const files = data.filter((item) => item.format);
    const folders = data.filter((item) => !item.format);

    return (
      <div className="flex flex-col gap-6">
        {folders.length > 0 && (
          <div>
            <h4 className="mb-2 text-16-medium text-heading">Folders</h4>
            <div className="flex flex-wrap gap-3 sm:flex-row md:gap-8">
              {folders.map((item) => (
                <CustomFileSystemItem
                  key={item.id}
                  file={item}
                  selectionMode={selectionMode}
                  isSelected={selectedItems.has(item.id)}
                  onSelectionChange={onSelectionChange}
                />
              ))}
            </div>
          </div>
        )}
        {files.length > 0 && (
          <div>
            <h4 className="mb-2 text-16-medium text-heading">Files</h4>
            <div className="flex flex-wrap gap-3 sm:flex-row md:gap-8">
              {files.map((item) => (
                <CustomFileSystemItem
                  key={item.id}
                  file={item}
                  selectionMode={selectionMode}
                  isSelected={selectedItems.has(item.id)}
                  onSelectionChange={onSelectionChange}
                />
              ))}
            </div>
          </div>
        )}
        {hasNextPage && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="secondary"
              onClick={() => fetchNextPage?.()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col flex-wrap gap-3 sm:flex-row',
        isFolderEmpty && 'flex-row items-center justify-center',
      )}
    >
      {isFolderEmpty ? (
        noDataComponent
      ) : (
        <>
          {itemsToDisplay.map((item) => (
            <CustomFileSystemItem
              key={item.id}
              file={item}
              selectionMode={selectionMode}
              isSelected={selectedItems.has(item.id)}
              onSelectionChange={onSelectionChange}
            />
          ))}
          {hasNextPage && (
            <div className="mt-4 flex w-full justify-center">
              <Button
                variant="secondary"
                onClick={() => fetchNextPage?.()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
