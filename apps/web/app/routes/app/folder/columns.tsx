import { FileTextIcon, Minus, MoreVertical } from 'lucide-react';

import { filesize } from 'filesize';

import {
  Button,
  Checkbox,
  Avatar,
  AvatarImage,
  AvatarFallback,
  cn,
  useFileMenu,
  ROUTE_PATH,
} from '@keepcloud/web-core/react';
import { DayjsHelper, NameFormatterHelper } from '@keepcloud/commons/helpers';
import { Owner } from '@keepcloud/commons/types';
import { FolderIconOutline, OwnerIcon } from '../../../components';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router';
import { FileMinViewDto, UserProfileDto } from '@keepcloud/commons/dtos';

export const columns: ColumnDef<FileMinViewDto>[] = [
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
      const isFolder = row.original.contentType == 'folder';
      const navigate = useNavigate();
      const url = ROUTE_PATH.folderDetails(row.original.id);

      const handleClick = () => {
        if (isFolder) {
          navigate(url);
        }
      };
      return (
        <div
          className="flex cursor-pointer items-center gap-2 truncate text-14-medium text-secondary-foreground"
          onClick={handleClick}
        >
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
    header: () => <div className="text-right">Size</div>,
    meta: {
      name: 'Size',
    },
    cell: ({ row }) => {
      const isFolder = row.original.contentType === 'folder';
      if (isFolder)
        return (
          <div className="flex justify-center md:justify-end">
            <Minus size={16} />
          </div>
        );
      const formatted = filesize(row.getValue('size'));

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
        <div className="flex items-center justify-center">
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
