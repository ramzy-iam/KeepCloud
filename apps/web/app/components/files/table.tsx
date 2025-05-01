'use client';

import { ColumnDef } from '@tanstack/react-table';
import { FileTextIcon, FunnelIcon, MoreVertical } from 'lucide-react';

import { filesize } from 'filesize';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Button,
  Checkbox,
  Avatar,
  AvatarImage,
  AvatarFallback,
  cn,
  useFileTable,
  useFileMenu,
} from '@keepcloud/web-core/react';
import { DayjsHelper, NameFormatterHelper } from '@keepcloud/commons/helpers';
import { data } from '@keepcloud/commons/types';
import { FolderIconOutline } from '../ui';

export type File = {
  id: string;
  name: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    picture: string;
  };
  isFolder?: boolean;
  size: number;
  lastModified: string;
};

export const columns: ColumnDef<File>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const isFolder = row.original.isFolder;
      return (
        <div className="flex items-center gap-2 truncate text-14-medium text-secondary-foreground">
          {isFolder ? (
            <FolderIconOutline />
          ) : (
            <FileTextIcon size={16} className="text-app-accent" />
          )}
          <div>{row.getValue('name')}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'owner',
    header: 'Owner',
    cell: ({ row }) => {
      const owner = row.getValue('owner') as File['owner'];

      return (
        <div className="flex items-center gap-2 capitalize">
          <Avatar className={cn('h-[24px] w-[24px]')}>
            <AvatarImage src={owner.picture} />
            <AvatarFallback>
              {NameFormatterHelper.format(
                [owner.firstName, owner.lastName],
                'initials',
              )}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-14-medium text-secondary-foreground">
            {owner.firstName} {owner.lastName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'size',
    header: () => <div className="text-right">Size</div>,
    cell: ({ row }) => {
      const formatted = filesize(row.getValue('size'));
      return (
        <div className="truncate text-right text-14-medium text-secondary-foreground">
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: 'lastModified',
    header: () => <div className="text-right">Last Modified</div>,
    cell: ({ row }) => {
      const formatted = DayjsHelper.new(row.getValue('lastModified')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
      return (
        <div className="truncate text-right text-14-medium text-secondary-foreground">
          {formatted}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-center">Actions</div>,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center">
          {RenderActionMenu(row.original)}
        </div>
      );
    },
  },
];

const RenderActionMenu = (file: File) => {
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

export function DataTableDemo() {
  const { table, TableComponent } = useFileTable({
    data: data,
    columns,
  });

  const beforeTable = (
    <div className="flex items-center gap-2 py-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className="ml-auto h-8 w-8 px-0 md:h-[32px] md:w-[85px]"
          >
            <FunnelIcon />
            <span className="hidden md:inline">Filters</span>
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
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

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

  return <TableComponent beforeTable={beforeTable} footer={footer} />;
}
