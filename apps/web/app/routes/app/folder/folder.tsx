import {
  authAtom,
  useGetActiveFolder,
  useGetRootItems,
} from '@keepcloud/web-core/react';
import { FolderView } from '../../../components';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { columns } from './columns';
import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { useBulkSelectionProvider, useBulkActionHandler } from '../../../hooks';

export default function FolderRootComponent() {
  const {
    allPageItems: items,
    isLoading: isLoadingRootItems,
    paginationProps,
  } = useGetRootItems({});
  const authState = useAtomValue(authAtom);
  const { setActiveFolder, activeFolder } = useGetActiveFolder();

  useEffect(() => {
    if (authState?.user.root && activeFolder?.id !== authState.user.root) {
      setActiveFolder({
        id: authState.user.root,
        name: SYSTEM_FILE.MY_STORAGE.name,
      });
    }
  }, [authState?.user.root, activeFolder, setActiveFolder]);

  // Bulk action handlers for root folder items
  const { handleBulkAction } = useBulkActionHandler({
    handlers: {
      onDownload: async (items) => {
        console.log('Downloading root folder items:', items);
      },

      onTrash: async (items) => {
        console.log('Moving root folder items to trash:', items);
      },
    },
  });

  // Bulk selection for root folder items
  const rootSelection = useBulkSelectionProvider({
    items: items || [],
    baseColumns: columns,
    config: {
      enableSelection: true,
      availableBulkActions: ['download', 'trash'],
      onBulkAction: handleBulkAction,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <FolderView
        columns={rootSelection.columns}
        items={items}
        title={SYSTEM_FILE.MY_STORAGE.name}
        isLoading={isLoadingRootItems}
        currentId={SYSTEM_FILE.MY_STORAGE.id}
        {...rootSelection.folderViewProps}
        {...paginationProps}
      />
    </div>
  );
}
