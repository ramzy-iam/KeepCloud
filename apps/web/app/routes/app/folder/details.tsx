import { useGetFolder, useGetFolderChildren } from '@keepcloud/web-core/react';
import { FolderView } from '../../../components';
import type { Route } from './+types/details';

export default function FolderDetailsComponent({
  params,
}: Route.ComponentProps) {
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

  return (
    <div className="flex flex-col gap-6">
      <FolderView
        folder={{ ...folder, children: folderChildren ?? [] }}
        title={folder?.name}
      />
    </div>
  );
}
