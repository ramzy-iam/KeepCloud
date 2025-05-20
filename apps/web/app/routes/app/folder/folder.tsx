import { useGetRootItems } from '@keepcloud/web-core/react';
import { FolderView } from '../../../components';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { columns } from './columns';

export default function FolderRootComponent({}) {
  const { data: items, isLoading: isLoadingRootItems } = useGetRootItems();

  return (
    <div className="flex flex-col gap-6">
      <FolderView
        items={items?.items}
        title={SYSTEM_FILE.MY_STORAGE.name}
        columns={columns}
        isLoading={isLoadingRootItems}
      />
    </div>
  );
}
