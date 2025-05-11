import { FolderView } from '../../../components';
import { files, folders } from '@keepcloud/commons/types';
import { columns } from './columns';

export default function ExplorerComponent() {
  return (
    <div className="flex flex-col gap-6">
      <FolderView
        columns={columns}
        items={[]}
        title="Suggested Folders"
        fixedView="grid"
        className="mb-0"
      />
      <FolderView
        columns={columns}
        items={[]}
        title="Suggested Files"
        group={true}
      />
    </div>
  );
}
