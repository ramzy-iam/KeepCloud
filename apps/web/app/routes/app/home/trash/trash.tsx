import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import {
  TrashEmpty,
  FolderView,
  TrashedSystemItem,
} from '../../../../components';
import { columns } from './columns';
import { useGetTrashedItems } from '@keepcloud/web-core/react';
import {
  useBulkSelectionProvider,
  useBulkActionHandler,
  BULK_ACTION_CONFIGS,
} from '../../../../hooks';
import { ColumnDef } from '@tanstack/react-table';
import { FileMinViewDto } from '@keepcloud/commons/dtos';

export default function TrashComponent() {
  const {
    allPageItems: items,
    isLoading,
    paginationProps,
  } = useGetTrashedItems();

  const { handleBulkAction } = useBulkActionHandler();

  const trashSelection = useBulkSelectionProvider({
    items: items || [],
    baseColumns: columns as ColumnDef<FileMinViewDto>[],
    config: {
      enableSelection: true,
      availableBulkActions: BULK_ACTION_CONFIGS.TRASH,
      onBulkAction: handleBulkAction,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <FolderView
          columns={trashSelection.columns}
          items={items}
          title={SYSTEM_FILE.TRASH.name}
          defaultViewMode="table"
          isLoading={isLoading}
          noDataComponent={<TrashEmpty />}
          CustomFileSystemItem={TrashedSystemItem}
          currentId={SYSTEM_FILE.TRASH.id}
          {...trashSelection.folderViewProps}
          {...paginationProps}
        />
      </div>
    </div>
  );
}
