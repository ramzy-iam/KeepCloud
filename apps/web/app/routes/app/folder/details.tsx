import { FolderView } from '../../../components';
import type { Route } from './+types/details';
import { File, fileTreeFolders } from '@keepcloud/commons/types';

export function findFileById(id: string, files: File[]): File | undefined {
  for (const file of files) {
    if (file.id === id) return file;
    if (file.children) {
      const found = findFileById(id, file.children);
      if (found) return found;
    }
  }
  return undefined;
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const folder = findFileById(params.folderId, fileTreeFolders);
  return folder ?? null;
}

export default function FolderDetailsComponent({
  loaderData,
}: Route.ComponentProps) {
  const folder = loaderData;

  if (!folder) {
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
      <FolderView folder={folder} title={folder?.name} />
    </div>
  );
}
