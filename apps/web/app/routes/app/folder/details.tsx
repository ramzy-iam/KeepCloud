import {
  useGetFolder,
  useGetFolderChildren,
  useGetActiveFolder,
  DEFAULT_ACTIVE_FOLDER,
  ROUTE_PATH,
  useDialog,
} from '@keepcloud/web-core/react';
import { FolderView } from '../../../components';
import type { Route } from './+types/details';
import { FileAncestor } from '@keepcloud/commons/dtos';
import { useNavigate } from 'react-router';
import { useEffect, useRef } from 'react';
import { columns } from './columns';

export default function FolderDetailsComponent({
  params,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const { setActiveFolder } = useGetActiveFolder();
  const { openDialog } = useDialog();
  const hasOpenedRef = useRef(false);

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

  useEffect(() => {
    if (
      !hasOpenedRef.current &&
      error?.code === 'RESOURCE_TRASHED' &&
      error.details?.length
    ) {
      const detail = error.details[0];

      if (
        detail.code === 'FOLDER_TRASHED' ||
        detail.code === 'PARENT_FOLDER_TRASHED'
      ) {
        openDialog({
          type: 'resourceTrashed',
          context: {
            isFolder: true,
            code: detail.code,
          },
        });
        hasOpenedRef.current = true; // prevent re-firing
      }
    }
  }, [error, openDialog]);

  if (error || !folder) {
    return isLoading ? null : (
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

  const enhancedAncestors: FileAncestor[] = folder.ancestors || [];

  const handleBreadcrumbClick = (ancestor: FileAncestor) => {
    const activeFolder =
      ancestor.id === 'null'
        ? DEFAULT_ACTIVE_FOLDER
        : {
            id: ancestor.id,
            name: ancestor.name,
          };
    setActiveFolder(activeFolder);

    const route = ancestor.isSystem
      ? ROUTE_PATH.system(ancestor.code)
      : ROUTE_PATH.folderDetails(ancestor.id);

    navigate(route);
  };

  return (
    <FolderView
      folder={{
        ...folder,
        ancestors: enhancedAncestors,
        children: folderChildren,
      }}
      columns={columns}
      title={folder.name}
      isLoading={isLoading || isLoadingChildren}
      onBreadcrumbClick={handleBreadcrumbClick}
    />
  );
}
