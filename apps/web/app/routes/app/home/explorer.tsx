import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { FolderView, SuggestionEmpty } from '../../../components';
import { columns } from './columns';
import {
  useGetSuggestedFiles,
  useGetSuggestedFolders,
} from '@keepcloud/web-core/react';

export default function ExplorerComponent() {
  const {
    allPageItems: suggestedFolders,
    isLoading: isLoadingSuggestedFolders,
  } = useGetSuggestedFolders();
  const { allPageItems: suggestedFiles, isLoading: isLoadingSuggestedFiles } =
    useGetSuggestedFiles();

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
      />

      <FolderView
        columns={columns}
        items={suggestedFiles}
        isLoading={isLoadingSuggestedFiles}
        title={SYSTEM_FILE.SUGGESTED_FILES.name}
        noDataComponent={<SuggestionEmpty />}
        currentId={SYSTEM_FILE.SUGGESTED_FILES.id}
      />
    </div>
  );
}
