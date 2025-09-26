import { Minus, MoreVertical } from 'lucide-react';

import {
  Button,
  useFileMenu,
  ROUTE_PATH,
  useFileIcon,
  useDialog,
  TooltipProviderWrapper,
} from '@keepcloud/web-core/react';
import { OwnerIcon } from '../../../components';
import { ColumnDef, Row } from '@tanstack/react-table';
import { useNavigate } from 'react-router';
import { FileMinViewDto, UserProfileDto } from '@keepcloud/commons/dtos';
import { FileHelper } from '@keepcloud/commons/helpers';

const NameColumn = ({ row }: { row: Row<FileMinViewDto> }) => {
  const file = row.original;
  const isFolder = file.isFolder;
  const navigate = useNavigate();
  const url = ROUTE_PATH.folderDetails(row.original.id);
  const Icon = useFileIcon(row.original);
  const { openDialog } = useDialog();

  const handleClick = () => {
    if (isFolder) {
      navigate(url);
    } else {
      openDialog({
        type: 'previewFile',
        item: file,
      });
    }
  };
  return (
    <TooltipProviderWrapper content={file.name} sideOffset={0}>
      <div
        className="flex max-w-[200px] cursor-pointer items-center gap-2 overflow-hidden text-14-medium text-secondary-foreground sm:max-w-[400px] lg:max-w-[600px]"
        onClick={handleClick}
      >
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
