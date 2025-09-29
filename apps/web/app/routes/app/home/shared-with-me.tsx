import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { FolderView } from '../../../components';
import { columns } from './columns';
import { useGetSharedWithMe } from '@keepcloud/web-core/react';
import { useBulkSelectionProvider, useBulkActionHandler } from '../../../hooks';

export default function SharedWithMeComponent() {
  const {
    allPageItems: items,
    isLoading,
    paginationProps,
  } = useGetSharedWithMe({});

  // Bulk action handlers for shared files
  const { handleBulkAction } = useBulkActionHandler({
    handlers: {
      onDownload: async (items) => {
        console.log('Downloading shared files:', items);
      },
    },
  });

  // Bulk selection for shared files
  const sharedSelection = useBulkSelectionProvider({
    items: items || [],
    baseColumns: columns,
    config: {
      enableSelection: true,
      availableBulkActions: ['download'],
      onBulkAction: handleBulkAction,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <FolderView
          columns={sharedSelection.columns}
          items={items}
          title={SYSTEM_FILE.SHARED_WITH_ME.name}
          defaultViewMode="table"
          isLoading={isLoading}
          currentId={SYSTEM_FILE.MY_STORAGE.id}
          {...sharedSelection.folderViewProps}
          {...paginationProps}
        />
      </div>
    </div>
  );
}
