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

interface UseFileTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  initialSorting?: SortingState;
  initialColumnVisibility?: VisibilityState;
  noRowsComponent?: React.ReactNode;
  isLoading?: boolean; // Indicates initial data loading
  isLoadingMore?: boolean; // Indicates loading more data
  skeletonComponent?: React.ReactNode; // Custom skeleton UI
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

function renderTableRow<TData>(row: Row<TData>) {
  return (
    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
      {row.getVisibleCells().map(renderTableCell)}
    </TableRow>
  );
}

function renderTableCell<TData>(cell: Cell<TData, unknown>) {
  return (
    <TableCell key={cell.id}>
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
}: UseFileTableProps<TData>): UseFileTableReturn<TData> {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility);
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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

      const hasRows = table.getRowModel().rows?.length > 0;

      if (!hasRows) {
        return (
          <TableRow className="hover:bg-none">
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center hover:bg-none"
            >
              {noRowsComponent || renderDefaultNoRowsComponent()}
            </TableCell>
          </TableRow>
        );
      }

      return (
        <>
          {table.getRowModel().rows.map(renderTableRow)}

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
      <div className="w-full">
        {header}
        <div className="rounded-md border">
          <Table>
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
        </div>
        {table.getRowModel().rows.length > 0 && footer}
      </div>
    );
  };
  return {
    table,
    TableComponent,
  };
}
