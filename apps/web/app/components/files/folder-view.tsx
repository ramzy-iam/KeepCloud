import {
  Tabs,
  TabsList,
  TabsTrigger,
  cn,
  useFolderViewMode,
} from '@keepcloud/web-core/react';
import { LayoutGrid, StretchHorizontal } from 'lucide-react';
import { useState } from 'react';
import { FileMainCategory, FolderViewMode } from '@keepcloud/commons/types';
import { GridView } from './grid-view';
import { TableView } from './table-view';
import { FolderBreadcrumb } from './folder-breadcrumb';
import { FileAncestor, FileMinViewDto } from '@keepcloud/commons/dtos';
import { ColumnDef } from '@tanstack/react-table';

type ViewMode = 'grid' | 'table';

interface FolderViewProps {
  folder?: FileMinViewDto;
  items?: FileMinViewDto[];
  columns: ColumnDef<FileMinViewDto>[];
  categoryToDisplay?: FileMainCategory;
  title: string;
  defaultViewMode?: ViewMode;
  fixedView?: ViewMode;
  group?: boolean;
  className?: string;
  onBreadcrumbClick?: (ancestor: FileAncestor) => void;
}

export const FolderView = ({
  folder,
  items = [],
  categoryToDisplay = 'all',
  title,
  group = false,
  fixedView,
  className,
  onBreadcrumbClick,
  columns,
}: FolderViewProps) => {
  const { view: preferredViewMode, setFolderViewMode } = useFolderViewMode();
  const [viewMode, _] = useState<ViewMode>(fixedView ?? preferredViewMode);
  const data = folder?.children ?? items;

  const displayOnlyFolders = categoryToDisplay === 'folder';

  const filteredItems = data.filter((item) => {
    if (categoryToDisplay === 'folder') return item.contentType == 'folder';
    if (categoryToDisplay === 'file') return item.contentType != 'folder';
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.contentType === 'folder' && b.contentType === 'folder') {
      return a.name.localeCompare(b.name);
    }
    return a.contentType === 'folder' ? -1 : 1;
  });

  const tabClassName =
    'data-[state=active]:bg-primary! data-[state=active]:text-white-light!';

  return (
    <div className={cn('mb-8 flex flex-col gap-3', className)}>
      <div className="sticky -top-[1px] z-[1] flex items-center justify-between bg-background p-1.5 pl-0">
        {title && !folder && (
          <h3 className="text-20-medium text-heading">{title}</h3>
        )}
        {folder && (
          <FolderBreadcrumb
            folder={folder}
            onBreadcrumbClick={onBreadcrumbClick}
          />
        )}
        {!fixedView && (
          <div className="flex gap-2">
            <Tabs
              defaultValue={viewMode}
              onValueChange={(value) =>
                setFolderViewMode(value as FolderViewMode)
              }
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
        />
      ) : (
        <TableView
          data={sortedItems}
          onlyFolders={displayOnlyFolders}
          columns={columns}
        />
      )}
    </div>
  );
};
