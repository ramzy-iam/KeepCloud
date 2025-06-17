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
import {
  FileAncestorDto,
  FileMinViewDto,
  PaginationDto,
} from '@keepcloud/commons/dtos';
import { useNavigate } from 'react-router';
import { useEffect, useRef } from 'react';
import { columns } from './columns';
import { ErrorCode } from '@keepcloud/commons/constants';

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

  const {
    allPageItems: folderChildren = [],
    isLoading: isLoadingChildren,
    paginationProps,
  } = useGetFolderChildren({
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
    if (!hasOpenedRef.current && error) {
      const detail = error.details[0];

      if (
        detail.code === ErrorCode.FOLDER_TRASHED ||
        detail.code === ErrorCode.PARENT_FOLDER_TRASHED
      ) {
        openDialog({
          type: 'resourceTrashed',
          context: {
            isFolder: true,
            code: detail.code,
          },
        });
        hasOpenedRef.current = true;
      } else if (detail.code === ErrorCode.FOLDER_NOT_FOUND) {
        openDialog({
          type: 'folderNotFound',
          context: {
            isFolder: false,
            code: detail.code,
          },
        });
        hasOpenedRef.current = true; // prevent re-firing
      }
    }
  }, [error, openDialog]);

  if (error || !folder) {
    return null;
  }

  const enhancedAncestors: FileAncestorDto[] = folder?.ancestors || [];

  const handleBreadcrumbClick = (ancestor: FileAncestorDto) => {
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
      isLoading={isLoading || isLoadingChildren || !!error}
      onBreadcrumbClick={handleBreadcrumbClick}
      currentId={params.folderId}
      {...paginationProps}
    />
  );
}
