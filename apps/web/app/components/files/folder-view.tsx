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
import { FileAncestorDto, FileMinViewDto } from '@keepcloud/commons/dtos';
import { ColumnDef } from '@tanstack/react-table';
import { GridView } from './grid-view';
import { TableView } from './table-view';
import { FolderBreadcrumb } from './folder-breadcrumb';
import { FolderEmpty } from '../ui';
import { BulkAction } from '@keepcloud/commons/types';
import { BulkOperationMenu } from './bulk-operation-menu';
import { useBulkSelection } from '../../hooks/use-bulk-selection';
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
  onBreadcrumbClick?: (ancestor: FileAncestorDto) => void;
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
  currentId: string;

  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;

  enableSelection?: boolean;
  onBulkAction?: (action: BulkAction, items: FileMinViewDto[]) => void;
  availableBulkActions?: BulkAction[];

  // External selection state props
  externalSelection?: {
    selectedItems: Set<string>;
    selectedCount: number;
    isAllSelected: boolean;
    isIndeterminate: boolean;
    toggleItem: (id: string) => void;
    toggleAll: (items: FileMinViewDto[]) => void;
    clearSelection: () => void;
    getSelectedItems: (items: FileMinViewDto[]) => FileMinViewDto[];
  };
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
  currentId,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  enableSelection = true,
  onBulkAction,
  availableBulkActions,
  externalSelection,
}: FolderViewProps) => {
  const { view: preferredViewMode, setFolderViewMode } = useFolderViewMode();
  const [viewMode, setViewMode] = useState<FolderViewMode>(
    fixedView ?? preferredViewMode,
  );
  const [internalLoading, setInternalLoading] = useState(isLoading);
  const [selectionMode, setSelectionMode] = useState(false);

  // Use external selection if provided, otherwise use internal selection
  const internalBulkSelection = useBulkSelection();
  const {
    selectedItems,
    selectedCount,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleAll,
    clearSelection,
    getSelectedItems,
  } = externalSelection || internalBulkSelection;

  const paginationOptions = {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };

  const data = folder?.children ?? items;

  const displayOnlyFolders = categoryToDisplay === 'folder';

  const filteredItems = data.filter((item) => {
    if (categoryToDisplay === 'folder') return item.isFolder;
    if (categoryToDisplay === 'file') return !item.isFolder;
    return true;
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
  }, [preferredViewMode, fixedView, setFolderViewMode, viewMode]);

  // Auto-exit selection mode when no items are selected
  useEffect(() => {
    if (selectedCount === 0 && selectionMode) {
      setSelectionMode(false);
    }
  }, [selectedCount, selectionMode]);

  const handleSelectionChange = (
    id: string,
    selected: boolean,
    addToSelection = false,
  ) => {
    if (!enableSelection) return;

    if (addToSelection) {
      toggleItem(id);
    } else {
      clearSelection();
      if (selected) {
        toggleItem(id);
      }
    }

    if (!selectionMode && selected) {
      setSelectionMode(true);
    }
  };

  const handleSelectAll = () => {
    if (!enableSelection) return;
    toggleAll(filteredItems);
  };

  const handleClearSelection = () => {
    clearSelection();
    setSelectionMode(false);
  };

  const handleBulkAction = (
    action: BulkAction,
    selectedItems: FileMinViewDto[],
  ) => {
    onBulkAction?.(action, selectedItems);
    if (action === 'trash' || action === 'delete') {
      clearSelection();
      setSelectionMode(false);
    }
  };

  return (
    <div className={cn('mb-8 flex h-full flex-col gap-3', className)}>
      <div className="sticky top-0 z-[3] bg-background">
        {enableSelection && (
          <BulkOperationMenu
            selectedItems={getSelectedItems(filteredItems)}
            selectedCount={selectedCount}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onBulkAction={handleBulkAction}
            availableActions={availableBulkActions}
          />
        )}

        <div className="flex h-12 items-center justify-between p-1.5 pl-0">
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

          <div className="flex items-center gap-2">
            {!fixedView && !internalLoading && (
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
            )}
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <GridView
          data={filteredItems}
          onlyFolders={displayOnlyFolders}
          group={group}
          isLoading={internalLoading}
          noDataComponent={noDataComponent}
          CustomFileSystemItem={CustomFileSystemItem}
          selectionMode={enableSelection ? selectionMode : false}
          selectedItems={selectedItems}
          onSelectionChange={
            enableSelection ? handleSelectionChange : undefined
          }
          {...paginationOptions}
        />
      ) : (
        <TableView
          data={filteredItems}
          onlyFolders={displayOnlyFolders}
          columns={columns}
          isLoading={internalLoading}
          selectedItems={selectedItems}
          onSelectionChange={
            enableSelection ? handleSelectionChange : undefined
          }
          {...paginationOptions}
        />
      )}
    </div>
  );
};
