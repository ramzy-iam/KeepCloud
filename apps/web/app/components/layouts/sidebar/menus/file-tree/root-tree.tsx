import { FileFormat, SYSTEM_FILE } from '@keepcloud/commons/constants';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import {
  ROUTE_PATH,
  Skeleton,
  useGetFoldersForTree,
} from '@keepcloud/web-core/react';
import { FileNode } from './file-node';
import { FileTreeNode } from './file-tree-node';

export const RootTree = () => {
  const root: FileMinViewDto = {
    id: SYSTEM_FILE.MY_STORAGE.id,
    name: SYSTEM_FILE.MY_STORAGE.name,
    contentType: 'folder',
    size: '0',
    ancestors: [],
    children: [],
    format: FileFormat.DOC,
    owner: {
      id: SYSTEM_FILE.MY_STORAGE.id,
      firstName: SYSTEM_FILE.MY_STORAGE.name,
      lastName: SYSTEM_FILE.MY_STORAGE.name,
      email: SYSTEM_FILE.MY_STORAGE.name,
      picture: SYSTEM_FILE.MY_STORAGE.name,
    },
  };

  const { data, isLoading } = useGetFoldersForTree({
    filters: { type: 'FOLDER' },
  });

  return (
    <div>
      <FileNode file={root} noIcon={true} isRoot={true} url={ROUTE_PATH.folder}>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          data?.items
            ?.filter((child) => child.contentType === 'folder')
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((child) => <FileTreeNode key={child.id} file={child} />)
        )}
      </FileNode>
    </div>
  );
};
