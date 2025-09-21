import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { FolderView } from '../../../components';
import { columns } from './columns';
import { useGetSharedWithMe } from '@keepcloud/web-core/react';

export default function SharedWithMeComponent() {
  const {
    allPageItems: items,
    isLoading,
    paginationProps,
  } = useGetSharedWithMe({});
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <FolderView
          items={items}
          title={SYSTEM_FILE.SHARED_WITH_ME.name}
          columns={columns}
          defaultViewMode="table"
          isLoading={isLoading}
          currentId={SYSTEM_FILE.MY_STORAGE.id}
          {...paginationProps}
        />
      </div>
    </div>
  );
}
