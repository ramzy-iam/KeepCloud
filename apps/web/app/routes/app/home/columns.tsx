import { Minus, MoreVertical } from 'lucide-react';

import {
  Button,
  useFileMenu,
  useFileIcon,
  TooltipProviderWrapper,
  Checkbox,
} from '@keepcloud/web-core/react';
import { OwnerIcon } from '../../../components';
import { ColumnDef, Row } from '@tanstack/react-table';
import { FileMinViewDto, UserProfileDto } from '@keepcloud/commons/dtos';
import { FileHelper } from '@keepcloud/commons/helpers';

const NameColumn = ({ row }: { row: Row<FileMinViewDto> }) => {
  const file = row.original;
  const Icon = useFileIcon(row.original);

  return (
    <TooltipProviderWrapper content={file.name} sideOffset={0}>
      <div className="max- flex max-w-[200px] items-center gap-2 overflow-hidden text-14-medium text-secondary-foreground sm:max-w-[400px] lg:max-w-[600px]">
        <span className="flex-shrink-0">{Icon && <Icon />}</span>
        <span className="truncate">{file.name}</span>
      </div>
    </TooltipProviderWrapper>
  );
};

export const columns: ColumnDef<FileMinViewDto>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: {
      name: 'Name',
    },
    cell: NameColumn,
    enableHiding: false,
  },
  {
    accessorKey: 'owner',
    header: 'Owner',
    meta: {
      name: 'Owner',
    },
    cell: ({ row }) => {
      const owner: UserProfileDto = row.getValue('owner');

      return <OwnerIcon user={owner} />;
    },
  },
  {
    accessorKey: 'size',
    header: () => <div className="text-right">Size</div>,
    meta: {
      name: 'Size',
    },
    cell: ({ row }) => {
      const isFolder = row.original.isFolder;
      if (isFolder)
        return (
          <div className="flex justify-center md:justify-end">
            <Minus size={16} />
          </div>
        );
      const formatted = FileHelper.formatBytes(row.getValue('size'));

      return (
        <div className="truncate text-right text-14-medium text-secondary-foreground">
          {formatted}
        </div>
      );
    },
  },
  // {
  //   accessorKey: 'lastModified',
  //   header: () => <div className="text-right">Last Modified</div>,
  //   meta: {
  //     name: 'Last Modified',
  //   },
  //   cell: ({ row }) => {
  //     const formatted = DayjsHelper.new(row.getValue('lastModified')).format(
  //       'YYYY-MM-DD HH:mm:ss',
  //     );
  //     return (
  //       <div className="truncate text-right text-14-medium text-secondary-foreground">
  //         {formatted}
  //       </div>
  //     );
  //   },
  // },
  {
    id: 'actions',
    header: () => <div className="text-center">Actions</div>,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div
          className="flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          {RenderActionMenu(row.original)}
        </div>
      );
    },
  },
];

const RenderActionMenu = (file: FileMinViewDto) => {
  const { FileMenu } = useFileMenu({ file });
  return (
    <div className="flex items-center justify-center">
      <FileMenu>
        <Button variant="secondary" size={'icon'} className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreVertical />
        </Button>
      </FileMenu>
    </div>
  );
};

// Mobile-friendly columns with external selection support
export const createMobileSelectColumn = <TData,>(options?: {
  getRowId?: (row: TData) => string;
  externalSelection?: {
    selectedItems: Set<string>;
    onSelectionChange?: (
      id: string,
      selected: boolean,
      addToSelection?: boolean,
    ) => void;
    isAllSelected?: boolean;
    isIndeterminate?: boolean;
    onSelectAll?: () => void;
  };
}): ColumnDef<TData> => ({
  id: 'select',
  header: ({ table }) => {
    if (options?.externalSelection) {
      // Use external selection state
      const { isAllSelected, isIndeterminate, onSelectAll } =
        options.externalSelection;
      return (
        <div className="flex items-center justify-center px-2 md:hidden">
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el && isIndeterminate !== undefined) {
                const checkboxInput = el.querySelector(
                  'input[type="checkbox"]',
                );
                if (checkboxInput) {
                  (checkboxInput as HTMLInputElement).indeterminate =
                    isIndeterminate;
                }
              }
            }}
            onCheckedChange={() => onSelectAll?.()}
            aria-label="Select all"
            className="h-4 w-4"
          />
        </div>
      );
    }

    // Fallback to table internal selection
    return (
      <div className="flex items-center justify-center px-2 md:hidden">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="h-4 w-4"
        />
      </div>
    );
  },
  cell: ({ row }) => {
    if (options?.externalSelection) {
      // Use external selection state
      const { selectedItems, onSelectionChange } = options.externalSelection;
      const getRowId =
        options.getRowId || ((item: TData) => (item as { id: string }).id);
      const rowId = getRowId(row.original);
      const isSelected = selectedItems.has(rowId);

      return (
        <div className="flex items-center justify-center px-2 md:hidden">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
              onSelectionChange?.(rowId, !!checked, true);
            }}
            aria-label="Select row"
            className="h-4 w-4"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      );
    }

    // Fallback to table internal selection
    return (
      <div className="flex items-center justify-center px-2 md:hidden">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="h-4 w-4"
        />
      </div>
    );
  },
  enableSorting: false,
  enableHiding: false,
  meta: {
    name: 'Select',
    cellClassName: 'w-12 md:hidden',
  },
});

// Mobile-optimized columns with checkbox selection
export const mobileColumns: ColumnDef<FileMinViewDto>[] = [
  // Checkbox column (visible only on mobile) - will be configured with external selection
  createMobileSelectColumn<FileMinViewDto>(),
  ...columns,
];
