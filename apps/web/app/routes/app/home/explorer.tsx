import { FolderView, SuggestionEmpty } from '../../../components';
import { columns } from './columns';
import {
  useGetSuggestedFiles,
  useGetSuggestedFolders,
} from '@keepcloud/web-core/react';

export default function ExplorerComponent() {
  const { data: suggestedFolders, isLoading: isLoadingSuggestedFolders } =
    useGetSuggestedFolders();
  const { data: suggestedFiles, isLoading: isLoadingSuggestedFiles } =
    useGetSuggestedFiles();

  return (
    <div className="flex flex-col gap-6">
      <FolderView
        columns={columns}
        items={suggestedFolders}
        title="Suggested Folders"
        fixedView="grid"
        className="mb-0"
        isLoading={isLoadingSuggestedFolders}
        noDataComponent={<SuggestionEmpty />}
      />

      <FolderView
        columns={columns}
        items={suggestedFiles}
        isLoading={isLoadingSuggestedFiles}
        title="Suggested Files"
        noDataComponent={<SuggestionEmpty />}
      />
    </div>
  );
}
