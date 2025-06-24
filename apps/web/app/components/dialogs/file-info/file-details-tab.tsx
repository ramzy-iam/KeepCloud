import {
  FolderIcon,
  useGetFolder,
  authAtom,
  ROUTE_PATH,
  Skeleton,
} from '@keepcloud/web-core/react';
import { DayjsHelper, FileHelper } from '@keepcloud/commons/helpers';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { OwnerIcon } from '../../ui';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

interface FileDetailsTabProps {
  item: FileMinViewDto;
}

export function FileDetailsTab({ item }: FileDetailsTabProps) {
  const authState = useAtomValue(authAtom);
  const navigate = useNavigate();

  const { data: parentFolder, isPending } = useGetFolder({
    id: item?.parentId ?? '',
    query: { withAncestors: false },
    enabled: !!item?.parentId,
  });

  const [parentUrl, setParentUrl] = useState<string | null>(null);

  useEffect(() => {
    const isSystemFile = authState?.user.root === item?.parentId;
    if (isSystemFile) {
      setParentUrl(ROUTE_PATH.system(item?.parentId ?? ''));
    } else {
      setParentUrl(ROUTE_PATH.folderDetails(item?.parentId ?? ''));
    }
  }, [item?.parentId, authState?.user.root]);

  if (isPending) {
    return (
      <div className="space-y-2 text-sm">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">Name</span> <span>{item.name}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">Type</span>
        <span>{item.isFolder ? 'Folder' : item.format?.toUpperCase()}</span>
      </div>
      {!item.isFolder && (
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">Size</span>
          <span>{item.size ? FileHelper.formatBytes(+item.size) : '-'}</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">Owner</span>
        <OwnerIcon user={item.owner} withName={false} />
      </div>
      {item.createdAt && (
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">Created</span>
          <span>
            {DayjsHelper.new(item.createdAt).format('DD MMM YYYY, HH:mm')}
          </span>
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium">Location</span>
        {parentUrl && parentFolder ? (
          <button
            className="flex max-w-[200px] cursor-pointer gap-3 truncate text-right"
            onClick={() => navigate(parentUrl)}
          >
            <FolderIcon />
            <span>{parentFolder.name}</span>
          </button>
        ) : (
          '-'
        )}
      </div>
    </div>
  );
}
