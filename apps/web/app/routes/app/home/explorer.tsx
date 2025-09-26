import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { FolderView, SuggestionEmpty } from '../../../components';
import { columns } from './columns';
import {
  useGetSuggestedFiles,
  useGetSuggestedFolders,
} from '@keepcloud/web-core/react';
import {
  useBulkSelectionProvider,
  useBulkActionHandler,
  BULK_ACTION_CONFIGS,
} from '../../../hooks';

export default function ExplorerComponent() {
  const {
    allPageItems: suggestedFolders,
    isLoading: isLoadingSuggestedFolders,
  } = useGetSuggestedFolders();
  const {
    allPageItems: suggestedFiles,
    isLoading: isLoadingSuggestedFiles,
    paginationProps,
  } = useGetSuggestedFiles();

  const { handleBulkAction: handleFilesBulkAction } = useBulkActionHandler({
    handlers: {
      onDownload: async (items) => {
        console.log('Downloading suggested files:', items);
      },
      onShare: async (items) => {
        console.log('Sharing suggested files:', items);
      },

      onTrash: async (items) => {
        console.log('Moving suggested files to trash:', items);
      },
    },
  });

  const { handleBulkAction: handleFoldersBulkAction } = useBulkActionHandler({
    handlers: {
      onDownload: async (items) => {
        console.log('Downloading suggested folders:', items);
      },
      onShare: async (items) => {
        console.log('Sharing suggested folders:', items);
      },
    },
  });

  // Bulk selection for suggested files
  const filesSelection = useBulkSelectionProvider({
    items: suggestedFiles || [],
    baseColumns: columns,
    config: {
      enableSelection: true,
      availableBulkActions: BULK_ACTION_CONFIGS.FILES,
      onBulkAction: handleFilesBulkAction,
    },
  });

  // Bulk selection for suggested folders (simpler config)
  const foldersSelection = useBulkSelectionProvider({
    items: suggestedFolders || [],
    baseColumns: columns,
    config: {
      enableSelection: true,
      availableBulkActions: BULK_ACTION_CONFIGS.FOLDERS,
      onBulkAction: handleFoldersBulkAction,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <FolderView
        columns={foldersSelection.columns}
        items={suggestedFolders}
        title={SYSTEM_FILE.SUGGESTED_FOLDERS.name}
        fixedView="grid"
        className="mb-0"
        isLoading={isLoadingSuggestedFolders}
        noDataComponent={<SuggestionEmpty />}
        currentId={SYSTEM_FILE.SUGGESTED_FOLDERS.id}
        {...foldersSelection.folderViewProps}
      />

      <FolderView
        columns={filesSelection.columns}
        items={suggestedFiles}
        isLoading={isLoadingSuggestedFiles}
        title={SYSTEM_FILE.SUGGESTED_FILES.name}
        noDataComponent={<SuggestionEmpty />}
        currentId={SYSTEM_FILE.SUGGESTED_FILES.id}
        {...filesSelection.folderViewProps}
        {...paginationProps}
      />
    </div>
  );
}
