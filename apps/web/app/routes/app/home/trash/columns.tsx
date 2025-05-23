import { FileTextIcon, Minus, MoreVertical } from 'lucide-react';

import {
  Button,
  Checkbox,
  useTrashedFileMenu,
} from '@keepcloud/web-core/react';
import { DayjsHelper, FileHelper } from '@keepcloud/commons/helpers';
import {
  FolderIconOutline,
  OwnerIcon,
  FileLocationBreadcrumb,
} from '../../../../components';
import { ColumnDef } from '@tanstack/react-table';
import { TrashedFileDto, UserProfileDto } from '@keepcloud/commons/dtos';

interface RenderActionMenuProps {
  file: TrashedFileDto;
}

export const columns: ColumnDef<TrashedFileDto>[] = [
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
    meta: {
      name: 'Name',
    },
    cell: ({ row }) => {
      const isFolder = row.original.isFolder;

      return (
        <div className="flex cursor-pointer items-center gap-2 truncate text-14-medium text-secondary-foreground">
          {isFolder ? (
            <FolderIconOutline />
          ) : (
            <FileTextIcon size={16} className="text-app-accent" />
          )}
          <div>{row.getValue('name')}</div>
        </div>
      );
    },
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
    header: () => <div>Size</div>,
    meta: {
      name: 'Size',
    },
    cell: ({ row }) => {
      const isFolder = row.original.isFolder;
      if (isFolder) return <Minus size={16} />;
      const formatted = FileHelper.formatBytes(row.getValue('size'));

      return (
        <div className="truncate text-14-medium text-secondary-foreground">
          {formatted}
        </div>
      );
    },
  },
  {
    id: 'trashedAt',
    header: () => <div>Trashed On</div>,
    enableHiding: false,
    cell: ({ row }) => {
      const formatted = DayjsHelper.new(row.getValue('trashedAt')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
      return (
        <div className="truncate text-14-medium text-secondary-foreground">
          {formatted}
        </div>
      );
    },
  },
  {
    id: 'location',
    header: () => <div>Location</div>,
    enableHiding: false,
    minSize: 130,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="w-full max-w-[130px] truncate overflow-hidden text-right whitespace-nowrap">
          <FileLocationBreadcrumb folder={row.original} />
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-center"></div>,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="justify-centewr flex items-center">
          {RenderActionMenu({ file: row.original })}
        </div>
      );
    },
  },
];

const RenderActionMenu = ({ file }: RenderActionMenuProps) => {
  const { FileMenu } = useTrashedFileMenu(file);

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
