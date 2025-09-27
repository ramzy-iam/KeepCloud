import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { FolderView, SuggestionEmpty } from '../../../components';
import { columns } from './columns';
import {
  useGetActiveFolder,
  useGetSuggestedFiles,
  useGetSuggestedFolders,
} from '@keepcloud/web-core/react';
import {
  useBulkSelectionProvider,
  useBulkActionHandler,
  BULK_ACTION_CONFIGS,
} from '../../../hooks';
import { useEffect } from 'react';

export default function ExplorerComponent() {
  const { setActiveFolder } = useGetActiveFolder();

  const {
    allPageItems: suggestedFolders,
    isLoading: isLoadingSuggestedFolders,
  } = useGetSuggestedFolders();
  const {
    allPageItems: suggestedFiles,
    isLoading: isLoadingSuggestedFiles,
    paginationProps,
  } = useGetSuggestedFiles();

  const { handleBulkAction: handleFilesBulkAction } = useBulkActionHandler();

  const { handleBulkAction: handleFoldersBulkAction } = useBulkActionHandler();

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

  const foldersSelection = useBulkSelectionProvider({
    items: suggestedFolders || [],
    baseColumns: columns,
    config: {
      enableSelection: true,
      availableBulkActions: BULK_ACTION_CONFIGS.FILES,
      onBulkAction: handleFoldersBulkAction,
    },
  });
  useEffect(() => {
    setActiveFolder({
      id: SYSTEM_FILE.MY_STORAGE.id,
      name: SYSTEM_FILE.MY_STORAGE.name,
    });
  }, [setActiveFolder]);

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
