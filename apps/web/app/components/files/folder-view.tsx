import { Tabs, TabsList, TabsTrigger, cn } from '@keepcloud/web-core/react';
import { LayoutGrid, StretchHorizontal } from 'lucide-react';
import { useState } from 'react';
import { File, FileMainCategory } from '@keepcloud/commons/types';
import { GridView } from './grid-view';
import { TableView } from './table-view';

type ViewMode = 'grid' | 'table';

interface FolderViewProps {
  data: File[];
  categoryToDisplay?: FileMainCategory;
  title: string;
  defaultViewMode?: ViewMode;
  fixedView?: ViewMode;
  group?: boolean;
  className?: string;
}

export const FolderView = ({
  data,
  categoryToDisplay = 'all',
  title,
  defaultViewMode = 'grid',
  group = false,
  fixedView,
  className,
}: FolderViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>(
    fixedView ?? defaultViewMode,
  );
  const displayOnlyFolders = categoryToDisplay === 'folder';

  const filteredItems = data.filter((item) => {
    if (categoryToDisplay === 'folder') return item.fileType === 'folder';
    if (categoryToDisplay === 'file') return item.fileType !== 'folder';
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.fileType === 'folder' && b.fileType === 'folder') {
      return a.name.localeCompare(b.name);
    }
    return a.fileType === 'folder' ? -1 : 1;
  });

  const tabClassName =
    'data-[state=active]:bg-primary! data-[state=active]:text-white-light!';

  return (
    <div className={cn('mb-8 flex flex-col gap-3', className)}>
      <div className="sticky -top-[1px] z-[1] flex items-center justify-between bg-background p-1.5 pl-0">
        <h3 className="text-20-medium text-heading">{title}</h3>
        {!fixedView && (
          <div className="flex gap-2">
            <Tabs
              defaultValue={viewMode}
              onValueChange={(value) => setViewMode(value as ViewMode)}
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
        <TableView data={sortedItems} onlyFolders={displayOnlyFolders} />
      )}
    </div>
  );
};
