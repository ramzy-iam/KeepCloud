import {
  authAtom,
  useGetActiveFolder,
  useGetRootItems,
} from '@keepcloud/web-core/react';
import { FolderView } from '../../../components';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { columns } from './columns';
import { useEffect } from 'react';
import { useAtomValue } from 'jotai';

export default function FolderRootComponent() {
  const { data: items, isLoading: isLoadingRootItems } = useGetRootItems({});
  const authState = useAtomValue(authAtom);
  const { setActiveFolder, activeFolder } = useGetActiveFolder();

  useEffect(() => {
    if (authState?.user.root && activeFolder?.id !== authState.user.root) {
      setActiveFolder({
        id: authState.user.root,
        name: SYSTEM_FILE.MY_STORAGE.name,
      });
    }
  }, [authState?.user.root, activeFolder, setActiveFolder]);

  return (
    <div className="flex flex-col gap-6">
      <FolderView
        items={items?.items}
        title={SYSTEM_FILE.MY_STORAGE.name}
        columns={columns}
        isLoading={isLoadingRootItems}
        currentId={SYSTEM_FILE.MY_STORAGE.id}
      />
    </div>
  );
}
