import { StorageService } from '@keepcloud/web-core/react';
import { FolderView } from '../../../components';
import type { Route } from './+types/folder';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { columns } from './columns';

export async function clientLoader() {
  const { items } = await StorageService.getRootItems();
  return items as any;
}
export default function FolderRootComponent({
  loaderData,
}: Route.ComponentProps) {
  const items = loaderData;

  return (
    <div className="flex flex-col gap-6">
      <FolderView
        items={items}
        title={SYSTEM_FILE.MY_STORAGE.name}
        columns={columns}
      />
    </div>
  );
}
