import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '../components';

interface CreateSelectColumnOptions<TData> {
  /** Function to get unique ID from row data */
  getRowId?: (row: TData) => string;
  /** Whether this column should be visible only on mobile */
  mobileOnly?: boolean;
}

/**
 * Creates a checkbox selection column for tables, optimized for mobile use
 */
export function createSelectColumn<TData>(
  options: CreateSelectColumnOptions<TData> = {},
): ColumnDef<TData> {
  const {
    getRowId = (row: TData) => (row as { id: string }).id,
    mobileOnly = false,
  } = options;

  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className={mobileOnly ? 'md:hidden' : ''}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Select row ${getRowId(row.original)}`}
        className={mobileOnly ? 'md:hidden' : ''}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      name: 'Select',
      cellClassName: mobileOnly ? 'md:hidden' : '',
    },
  };
}

/**
 * Creates a mobile-only checkbox selection column
 */
export function createMobileSelectColumn<TData>(
  options: Omit<CreateSelectColumnOptions<TData>, 'mobileOnly'> = {},
): ColumnDef<TData> {
  return createSelectColumn({ ...options, mobileOnly: true });
}
