import { useState } from 'react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import {
  ROUTE_PATH,
  Skeleton,
  useGetFoldersForTree,
} from '@keepcloud/web-core/react';
import { FolderIcon } from '../../../../ui';
import { FileNode } from './file-node';

export const FileTreeNode = ({ file }: { file: FileMinViewDto }) => {
  if (file.contentType !== 'folder') {
    return null;
  }

  const [shouldFetch, setShouldFetch] = useState(false);

  const {
    data,
    isLoading,
    refetch: fetchChildren,
  } = useGetFoldersForTree({
    filters: { type: 'FOLDER', parentId: file.id },
    enabled: shouldFetch,
  });

  const sortedChildren = data?.items
    ? [...data.items].sort((a, b) => a.name.localeCompare(b.name))
    : file.children
      ? [...file.children]
          .filter((child) => child.isFolder)
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];

  return (
    <FileNode
      url={ROUTE_PATH.folderDetails(file.id)}
      file={{ ...file, children: sortedChildren }}
      icon={<FolderIcon />}
      fetchChildren={async () => {
        setShouldFetch(true);
        await fetchChildren();
        return data?.items || [];
      }}
    >
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      ) : (
        sortedChildren.map((child) => (
          <FileTreeNode key={child.id} file={child} />
        ))
      )}
    </FileNode>
  );
};
