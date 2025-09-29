import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { FolderView, SuggestionEmpty, BulkAction } from '../../../components';
import { columns } from './columns';
import {
  useGetSuggestedFiles,
  useGetSuggestedFolders,
} from '@keepcloud/web-core/react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';

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

  // Handle bulk operations for suggested files
  const handleBulkAction = (action: BulkAction, items: FileMinViewDto[]) => {
    console.log(
      `Bulk action: ${action} on ${items.length} items:`,
      items.map((item) => item.name),
    );

    switch (action) {
      case 'download':
        // Implement download logic for suggested files
        console.log('Downloading suggested files:', items);
        // You would typically call your download API here
        break;
      case 'share':
        // Implement share logic
        console.log('Sharing suggested files:', items);
        // Open share dialog or call share API
        break;
      case 'copy':
        // Implement copy logic
        console.log('Copying suggested files:', items);
        break;
      case 'move':
        // Implement move logic
        console.log('Moving suggested files:', items);
        break;
      case 'trash':
        // Implement trash logic
        console.log('Moving suggested files to trash:', items);
        break;
      case 'star':
        // Implement star logic
        console.log('Starring suggested files:', items);
        break;
      default:
        console.log('Unhandled bulk action:', action);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <FolderView
        columns={columns}
        items={suggestedFolders}
        title={SYSTEM_FILE.SUGGESTED_FOLDERS.name}
        fixedView="grid"
        className="mb-0"
        isLoading={isLoadingSuggestedFolders}
        noDataComponent={<SuggestionEmpty />}
        currentId={SYSTEM_FILE.SUGGESTED_FOLDERS.id}
        enableSelection={true}
        onBulkAction={handleBulkAction}
        availableBulkActions={['download', 'share', 'star']}
      />

      <FolderView
        columns={columns}
        items={suggestedFiles}
        isLoading={isLoadingSuggestedFiles}
        title={SYSTEM_FILE.SUGGESTED_FILES.name}
        noDataComponent={<SuggestionEmpty />}
        currentId={SYSTEM_FILE.SUGGESTED_FILES.id}
        enableSelection={true}
        onBulkAction={handleBulkAction}
        availableBulkActions={[
          'download',
          'share',
          'copy',
          'move',
          'star',
          'trash',
        ]}
        {...paginationProps}
      />
    </div>
  );
}
