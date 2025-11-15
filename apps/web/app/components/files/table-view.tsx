import { SlidersHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Button,
  useFileTable,
  useSidebar,
  Skeleton,
  useDialog,
  ROUTE_PATH,
} from '@keepcloud/web-core/react';
import { ColumnDef, Table } from '@tanstack/react-table';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { FolderEmpty } from '../ui';
import { useNavigate } from 'react-router';
import {
  useDeviceDetection,
  useInteractionHandlers,
} from '../../utils/interaction-utils';

interface TableViewProps {
  data: FileMinViewDto[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onlyFolders?: boolean;
  columns: ColumnDef<FileMinViewDto>[];
  isLoading?: boolean;
  noDataComponent?: React.ReactNode;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  selectedItems?: Set<string>;
  onSelectionChange?: (
    id: string,
    selected: boolean,
    addToSelection?: boolean,
  ) => void;
}

interface BeforeTableProps {
  table: Table<FileMinViewDto>;
}

const BeforeTable = ({ table }: BeforeTableProps) => {
  const { isMobile } = useSidebar();

  return (
    <div className="flex items-center gap-2 py-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size={isMobile ? 'icon' : 'sm'}
            className="ml-auto"
          >
            <SlidersHorizontal />
            <span className="hidden md:inline">Columns</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column?.columnDef.meta?.name}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export function TableView({
  data,
  header,
  footer: customFooter,
  columns,
  noDataComponent = <FolderEmpty />,
  onlyFolders = false,
  isLoading = false,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  selectedItems,
  onSelectionChange,
}: TableViewProps) {
  const { openDialog } = useDialog();
  const navigate = useNavigate();
  const { isMobile } = useDeviceDetection();
  const interactionHandlers = useInteractionHandlers(isMobile);

  const handleItemOpen = (file: FileMinViewDto) => {
    if (file.isFolder) {
      const url = ROUTE_PATH.folderDetails(file.id);
      navigate(url);
    } else {
      openDialog({
        type: 'previewFile',
        item: file,
      });
    }
  };

  const handleRowClick = (file: FileMinViewDto, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const isCheckboxColumn = target.closest('[data-column-id="select"]');
    const isActionsColumn = target.closest('[data-column-id="actions"]');

    // Skip actions column
    if (isActionsColumn) return;

    if (isMobile) {
      // Mobile: checkbox clicks for selection, other clicks for opening
      if (isCheckboxColumn && onSelectionChange) {
        const isShiftClick = event.shiftKey;
        onSelectionChange(file.id, !selectedItems?.has(file.id), isShiftClick);
      } else {
        // Mobile: tap to open - clear selection first if any items are selected
        if (onSelectionChange && selectedItems && selectedItems.size > 0) {
          selectedItems.forEach((itemId) => {
            onSelectionChange(itemId, false, false);
          });
        }
        handleItemOpen(file);
      }
    } else {
      // Desktop/Laptop: Handle checkbox clicks immediately
      if (isCheckboxColumn && onSelectionChange) {
        const isShiftClick = event.shiftKey;
        onSelectionChange(file.id, !selectedItems?.has(file.id), isShiftClick);
      } else {
        // Use the shared interaction handlers for proper click/double-click timing
        interactionHandlers.handleClick(event, file.id, onSelectionChange, () =>
          handleItemOpen(file),
        );
      }
    }
  };

  const handleRowDoubleClick = (
    file: FileMinViewDto,
    event: React.MouseEvent,
  ) => {
    const target = event.target as HTMLElement;
    const isActionsColumn = target.closest('[data-column-id="actions"]');

    // Skip actions column and mobile
    if (isActionsColumn || isMobile) return;

    // Clear external selection if onSelectionChange is provided
    if (onSelectionChange && selectedItems && selectedItems.size > 0) {
      // Clear all selected items by setting them to unselected
      selectedItems.forEach((itemId) => {
        onSelectionChange(itemId, false, false);
      });
    }

    // Use the shared interaction handlers for double-click
    interactionHandlers.handleDoubleClick(event, () => handleItemOpen(file));
  };

  const handleRowTouchStart = (
    file: FileMinViewDto,
    event: React.TouchEvent,
  ) => {
    // Optional: Add touch feedback or other mobile-specific behavior
  };

  const handleRowTouchEnd = (file: FileMinViewDto, event: React.TouchEvent) => {
    // Optional: Handle touch end events
  };

  const { table, TableComponent } = useFileTable({
    data: isLoading ? [] : data,
    columns,
    noRowsComponent: noDataComponent,
    onRowClick: handleRowClick,
    onRowDoubleClick: handleRowDoubleClick,
    onRowTouchStart: handleRowTouchStart,
    onRowTouchEnd: handleRowTouchEnd,
    mobileMode: isMobile,
    externalSelection: selectedItems
      ? {
          selectedItems,
          getRowId: (item: FileMinViewDto) => item.id,
        }
      : undefined,
  });

  const footer = (
    <div className="flex flex-col items-center justify-end space-y-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {/* {table.getFilteredSelectedRowModel().rows.length} of{' '} */}
        {/* {table.getFilteredRowModel().rows.length} item(s) selected. */}
      </div>
      {hasNextPage && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => fetchNextPage?.()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-full rounded-md border">
          <table className="w-full">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={index} className="p-4">
                    <Skeleton className="h-4 w-24" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="p-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <TableComponent
      beforeTable={header ?? <BeforeTable table={table} />}
      footer={customFooter ?? footer}
    />
  );
}
