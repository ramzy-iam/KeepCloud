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
} from '@keepcloud/web-core/react';
import { ColumnDef, Table } from '@tanstack/react-table';
import { FileMinViewDto } from '@keepcloud/commons/dtos';

interface TableViewProps {
  data: FileMinViewDto[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onlyFolders?: boolean;
  columns: ColumnDef<FileMinViewDto>[];
  isLoading?: boolean;
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
  onlyFolders = false,
  isLoading = false,
}: TableViewProps) {
  const { table, TableComponent } = useFileTable({
    data: isLoading ? [] : data, // Pass empty array during loading to avoid table rendering
    columns,
  });

  const footer = (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} item(s) selected.
      </div>
      <div className="space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
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
