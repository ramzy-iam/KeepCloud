import { FileFormat, SYSTEM_FILE } from '@keepcloud/commons/constants';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { ROUTE_PATH } from '@keepcloud/web-core/react';
import { FileNode } from './file-node';

export const RootTree = () => {
  const root: FileMinViewDto = {
    id: SYSTEM_FILE.MY_STORAGE.id,
    name: SYSTEM_FILE.MY_STORAGE.name,
    contentType: 'folder',
    isFolder: true,
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
      root: SYSTEM_FILE.MY_STORAGE.id,
    },
    parentId: null,
  };

  return (
    <div className="max-w-xs">
      <FileNode file={root} noIcon isRoot url={ROUTE_PATH.folder} />
    </div>
  );
};
