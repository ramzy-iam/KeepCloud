import { Minus, MoreVertical } from 'lucide-react';

import {
  Button,
  useFileIcon,
  useTrashedFileMenu,
} from '@keepcloud/web-core/react';
import { DayjsHelper, FileHelper } from '@keepcloud/commons/helpers';
import { OwnerIcon, FileLocationBreadcrumb } from '../../../../components';
import { ColumnDef, Row } from '@tanstack/react-table';
import { TrashedFileDto, UserProfileDto } from '@keepcloud/commons/dtos';

interface RenderActionMenuProps {
  file: TrashedFileDto;
}

const NameColumn = ({ row }: { row: Row<TrashedFileDto> }) => {
  const file = row.original;
  const Icon = useFileIcon(row.original);

  return (
    <div className="flex max-w-[200px] items-center gap-2 overflow-hidden text-14-medium text-secondary-foreground sm:max-w-[400px] lg:max-w-[600px]">
      <span className="flex-shrink-0">{Icon && <Icon />}</span>
      <span className="truncate">{file.name}</span>
    </div>
  );
};

export const columns: ColumnDef<TrashedFileDto>[] = [
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
      const formatted = DayjsHelper.formatLocal(row.getValue('trashedAt'));

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
