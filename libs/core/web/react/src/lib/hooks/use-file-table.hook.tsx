import * as React from 'react';
import {
  Cell,
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
} from '../components';
import { AlertCircle } from 'lucide-react';
import { cn } from '../helpers';

// Extend the meta interface to include cellClassName
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    name?: string;
    cellClassName?: string;
  }
}

interface UseFileTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  initialSorting?: SortingState;
  initialColumnVisibility?: VisibilityState;
  noRowsComponent?: React.ReactNode;
  isLoading?: boolean; // Indicates initial data loading
  isLoadingMore?: boolean; // Indicates loading more data
  skeletonComponent?: React.ReactNode; // Custom skeleton UI
  usePagination?: boolean;
  onRowClick?: (row: TData, event: React.MouseEvent) => void;
  onRowDoubleClick?: (row: TData, event: React.MouseEvent) => void;
  onRowTouchStart?: (row: TData, event: React.TouchEvent) => void;
  onRowTouchEnd?: (row: TData, event: React.TouchEvent) => void;
  externalSelection?: {
    selectedItems: Set<string>;
    getRowId?: (row: TData) => string;
  };
  mobileMode?: boolean; // New prop to enable mobile-specific behavior
}

interface UseFileTableReturn<TData> {
  table: ReturnType<typeof useReactTable<TData>>;
  TableComponent: React.FC<{
    beforeTable?: React.ReactNode;
    footer?: React.ReactNode;
  }>;
}

const renderDefaultNoRowsComponent = () => (
  <div className="flex flex-col items-center justify-center gap-2 py-4 text-muted-foreground">
    <AlertCircle className="h-8 w-8 text-primary" />
    <img src={'/'} alt="" />
    <h2 className="text-16-medium-medium text-heading">
      Drag and drop files here
    </h2>
    <p>or click on "New" button</p>
  </div>
);

const DefaultSkeletonComponent = () => (
  <div className="space-y-2 p-4">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="flex space-x-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    ))}
  </div>
);

function renderTableRow<TData>(
  row: Row<TData>,
  onRowClick?: (row: TData, event: React.MouseEvent) => void,
  onRowDoubleClick?: (row: TData, event: React.MouseEvent) => void,
  onRowTouchStart?: (row: TData, event: React.TouchEvent) => void,
  onRowTouchEnd?: (row: TData, event: React.TouchEvent) => void,
  externalSelection?: {
    selectedItems: Set<string>;
    getRowId?: (row: TData) => string;
  },
  table?: ReturnType<typeof useReactTable<TData>>,
  mobileMode?: boolean,
  clickTimeoutRef?: React.MutableRefObject<NodeJS.Timeout | null>,
) {
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isActionsColumn = target.closest('[data-column-id="actions"]');
    const isCheckboxColumn = target.closest('[data-column-id="select"]');

    if (!isActionsColumn && onRowClick) {
      // On mobile, if it's not a checkbox column, always open the item
      if (mobileMode && !isCheckboxColumn) {
        // Mobile: tap to open (let onRowClick handle the opening logic)
        onRowClick(row.original, e);
        return;
      }

      // Desktop behavior: delay single click to allow for double-click
      if (!mobileMode && clickTimeoutRef) {
        // Clear any existing timeout
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
        }

        // If it's a checkbox column, handle selection immediately
        if (isCheckboxColumn) {
          if (!externalSelection) {
            row.toggleSelected();
          }
          onRowClick(row.original, e);
          return;
        }

        // For regular clicks, use a timeout to distinguish from double-clicks
        clickTimeoutRef.current = setTimeout(() => {
          if (!externalSelection) {
            row.toggleSelected();
          }
          onRowClick(row.original, e);
          clickTimeoutRef.current = null;
        }, 200);
      } else if (!mobileMode) {
        // Fallback if no clickTimeoutRef provided (shouldn't happen normally)
        if (!externalSelection) {
          row.toggleSelected();
        }
        onRowClick(row.original, e);
      } else {
        // Mobile: handle checkbox clicks for selection
        if (isCheckboxColumn) {
          if (!externalSelection) {
            row.toggleSelected();
          }
          onRowClick(row.original, e);
        }
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Skip double-click on mobile
    if (mobileMode) return;

    const target = e.target as HTMLElement;
    const isActionsColumn = target.closest('[data-column-id="actions"]');

    if (!isActionsColumn && onRowDoubleClick) {
      e.preventDefault();
      e.stopPropagation();

      // Clear the single click timeout to prevent selection
      if (clickTimeoutRef && clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }

      // Clear all selections on successful double-click
      if (!externalSelection && table) {
        // Clear React Table internal selection
        table.resetRowSelection();
      }

      onRowDoubleClick(row.original, e);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (mobileMode && onRowTouchStart) {
      onRowTouchStart(row.original, e);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (mobileMode && onRowTouchEnd) {
      onRowTouchEnd(row.original, e);
    }
  };

  // Determine if row is selected based on external or internal selection
  let isSelected = false;
  if (externalSelection) {
    const getRowId =
      externalSelection.getRowId ||
      ((item: TData) => (item as { id: string }).id);
    const rowId = getRowId(row.original);
    isSelected = externalSelection.selectedItems.has(rowId);
  } else {
    isSelected = row.getIsSelected();
  }

  return (
    <TableRow
      key={row.id}
      data-state={isSelected && 'selected'}
      className="cursor-pointer"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {row.getVisibleCells().map(renderTableCell)}
    </TableRow>
  );
}

function renderTableCell<TData>(cell: Cell<TData, unknown>) {
  const cellClassName = cell.column.columnDef.meta?.cellClassName;
  return (
    <TableCell
      key={cell.id}
      className={cellClassName}
      data-column-id={cell.column.id}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
}

export function useFileTable<TData>({
  data,
  columns,
  initialSorting = [],
  initialColumnVisibility = {},
  noRowsComponent,
  isLoading = false,
  isLoadingMore = false,
  skeletonComponent,
  usePagination = false,
  onRowClick,
  onRowDoubleClick,
  onRowTouchStart,
  onRowTouchEnd,
  externalSelection,
  mobileMode = false,
}: UseFileTableProps<TData>): UseFileTableReturn<TData> {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility);
  const [rowSelection, setRowSelection] = React.useState({});
  
  // Ref to manage click timeout for distinguishing single vs double clicks
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    const timeoutRef = clickTimeoutRef.current;
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    ...(usePagination && {
      getPaginationRowModel: getPaginationRowModel(),
    }),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const hasRows = table.getRowModel().rows?.length > 0;

  const TableComponent: React.FC<{
    header?: React.ReactNode;
    footer?: React.ReactNode;
  }> = ({ header, footer }) => {
    const renderTableBody = () => {
      if (isLoading) {
        return (
          <TableRow className="hover:bg-none!">
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center hover:bg-none!"
            >
              {skeletonComponent || <DefaultSkeletonComponent />}
            </TableCell>
          </TableRow>
        );
      }

      if (!hasRows) {
        return (
          <TableRow className="hover:bg-none">
            <TableCell
              colSpan={columns.length}
              className="bg-white-light text-center hover:bg-none dark:bg-background"
            >
              <div>{noRowsComponent || renderDefaultNoRowsComponent()}</div>
            </TableCell>
          </TableRow>
        );
      }

      return (
        <>
          {table
            .getRowModel()
            .rows.map((row) =>
              renderTableRow(
                row,
                onRowClick,
                onRowDoubleClick,
                onRowTouchStart,
                onRowTouchEnd,
                externalSelection,
                table,
                mobileMode,
                clickTimeoutRef,
              ),
            )}

          {isLoadingMore && (
            <TableRow className="hover:bg-none!">
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center hover:bg-none!"
              >
                {skeletonComponent || <DefaultSkeletonComponent />}
              </TableCell>
            </TableRow>
          )}
        </>
      );
    };

    return (
      <div className={cn('w-full', !hasRows && 'h-full')}>
        {header}
        <Table
          className={cn(!hasRows && 'h-full')}
          containerClassName={cn(' rounded-md border', !hasRows && 'h-full')}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-stroke-50 hover:bg-stroke-50 dark:bg-neutral-800 dark:hover:bg-neutral-800"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
        {table.getRowModel().rows.length > 0 && footer}
      </div>
    );
  };
  return {
    table,
    TableComponent,
  };
}
