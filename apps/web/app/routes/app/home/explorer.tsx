import { FolderView } from '../../../components';
import { files, folders } from '@keepcloud/commons/types';

export default function ExplorerComponent() {
  return (
    <div className="flex flex-col gap-6">
      <FolderView
        items={folders}
        title="Suggested Folders"
        fixedView="grid"
        className="mb-0"
      />
      <FolderView items={files} title="Suggested Files" group={true} />
    </div>
  );
}
