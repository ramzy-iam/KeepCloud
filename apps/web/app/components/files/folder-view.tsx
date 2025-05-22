import { useEffect, useState } from 'react';
import {
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  cn,
  useFolderViewMode,
} from '@keepcloud/web-core/react';
import { LayoutGrid, StretchHorizontal } from 'lucide-react';
import { FileMainCategory, FolderViewMode } from '@keepcloud/commons/types';
import { FileAncestor, FileMinViewDto } from '@keepcloud/commons/dtos';
import { ColumnDef } from '@tanstack/react-table';
import { GridView } from './grid-view';
import { TableView } from './table-view';
import { FolderBreadcrumb } from './folder-breadcrumb';
import { FolderEmpty } from '../ui';

interface FolderViewProps {
  folder?: FileMinViewDto;
  items?: FileMinViewDto[];
  columns: ColumnDef<FileMinViewDto>[];
  categoryToDisplay?: FileMainCategory;
  title: string;
  defaultViewMode?: FolderViewMode;
  fixedView?: FolderViewMode;
  group?: boolean;
  className?: string;
  isLoading?: boolean;
  onBreadcrumbClick?: (ancestor: FileAncestor) => void;
  noDataComponent?: React.ReactNode;
  CustomFileSystemItem?: React.FC<{
    file: FileMinViewDto;
  }>;
}

export const FolderView = ({
  folder,
  items = [],
  categoryToDisplay = 'all',
  title,
  group = false,
  fixedView,
  className,
  isLoading = false,
  onBreadcrumbClick,
  columns,
  noDataComponent = <FolderEmpty />,
  CustomFileSystemItem,
}: FolderViewProps) => {
  const { view: preferredViewMode, setFolderViewMode } = useFolderViewMode();
  const [viewMode, setViewMode] = useState<FolderViewMode>(
    fixedView ?? preferredViewMode,
  );
  const [internalLoading, setInternalLoading] = useState(isLoading);
  const data = folder?.children ?? items;

  const displayOnlyFolders = categoryToDisplay === 'folder';

  const filteredItems = data.filter((item) => {
    if (categoryToDisplay === 'folder') return item.isFolder;
    if (categoryToDisplay === 'file') return !item.isFolder;
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.isFolder && b.isFolder) {
      return a.name.localeCompare(b.name);
    }
    return a.isFolder ? -1 : 1;
  });

  const tabClassName =
    'data-[state=active]:bg-primary! data-[state=active]:text-white-light!';

  useEffect(() => {
    setInternalLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (preferredViewMode !== viewMode && !fixedView) {
      setFolderViewMode(preferredViewMode);
      setViewMode(preferredViewMode);
    }
  }, [preferredViewMode, fixedView, setFolderViewMode]);

  return (
    <div className={cn('mb-8 flex h-full flex-col gap-3', className)}>
      <div className="sticky -top-[1px] z-[1] flex h-12 items-center justify-between bg-background p-1.5 pl-0">
        {internalLoading && (
          <div className="flex items-center gap-2 py-4">
            <Skeleton className="h-[30px] w-[200px]" />
          </div>
        )}
        {!internalLoading && title && !folder && (
          <h3 className="text-20-medium text-heading">{title}</h3>
        )}

        {folder && !internalLoading && (
          <FolderBreadcrumb
            folder={folder}
            onBreadcrumbClick={onBreadcrumbClick}
          />
        )}
        {!fixedView && !internalLoading && (
          <div className="flex gap-2">
            <Tabs
              defaultValue={viewMode}
              onValueChange={(value) => {
                setFolderViewMode(value as FolderViewMode);
                setViewMode(value as FolderViewMode);
              }}
            >
              <TabsList>
                <TabsTrigger value="table" className={tabClassName}>
                  <StretchHorizontal className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="grid" className={tabClassName}>
                  <LayoutGrid className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>
      {viewMode === 'grid' ? (
        <GridView
          data={sortedItems}
          onlyFolders={displayOnlyFolders}
          group={group}
          isLoading={internalLoading}
          noDataComponent={noDataComponent}
          CustomFileSystemItem={CustomFileSystemItem}
        />
      ) : (
        <TableView
          data={sortedItems}
          onlyFolders={displayOnlyFolders}
          columns={columns}
          isLoading={internalLoading}
          noDataComponent={noDataComponent}
        />
      )}
    </div>
  );
};
