import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { FolderView } from '../../../components';
import { columns } from './columns';

export default function SharedWithMeComponent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="sticky -top-[1px] z-[1] bg-background p-1.5 text-18-medium text-heading">
          Shared with me
        </h3>
        <FolderView
          items={[]}
          title={SYSTEM_FILE.SHARED_WITH_ME.name}
          columns={columns}
          defaultViewMode="table"
        />
      </div>
    </div>
  );
}
