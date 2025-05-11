import {
  useGetFolder,
  useGetFolderChildren,
  useGetActiveFolder,
  DEFAULT_ACTIVE_FOLDER,
  ROUTE_PATH,
} from '@keepcloud/web-core/react';
import { FolderView } from '../../../components';
import type { Route } from './+types/details';
import { FileAncestor } from '@keepcloud/commons/dtos';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { columns } from './columns';

export default function FolderDetailsComponent({
  params,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const { setActiveFolder } = useGetActiveFolder();

  const {
    data: folder,
    isLoading,
    error,
  } = useGetFolder({
    id: params.folderId,
    query: { withAncestors: true },
  });

  const { data: folderChildren = [], isLoading: isLoadingChildren } =
    useGetFolderChildren({
      id: params.folderId,
      enabled: !!folder,
    });

  useEffect(() => {
    if (!folder) return;
    setActiveFolder({
      id: params.folderId,
      name: folder.name,
    });
  }, [folder]);

  if (isLoading || isLoadingChildren) return <div>Loading...</div>;

  if (error || !folder) {
    return (
      <div>
        <h3 className="sticky top-0 z-[1] bg-background p-1.5 text-18-medium text-heading">
          Folder not found
        </h3>
        <div className="flex h-full items-center justify-center">
          <p className="text-secondary-foreground">
            This folder does not exist.
          </p>
        </div>
      </div>
    );
  }

  const enhancedAncestors: FileAncestor[] = [
    { id: 'null', name: SYSTEM_FILE.MY_STORAGE.name },
    ...(folder.ancestors || []),
  ];

  const handleBreadcrumbClick = (ancestor: FileAncestor) => {
    if (ancestor.id == 'null') {
      setActiveFolder(DEFAULT_ACTIVE_FOLDER);
      navigate(ROUTE_PATH.folder);
    } else {
      setActiveFolder({
        id: ancestor.id,
        name: ancestor.name,
      });

      navigate(ROUTE_PATH.folderDetails(ancestor.id));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <FolderView
        folder={{
          ...folder,
          ancestors: enhancedAncestors,
          children: folderChildren,
        }}
        columns={columns}
        title={folder.name}
        onBreadcrumbClick={handleBreadcrumbClick}
      />
    </div>
  );
}
