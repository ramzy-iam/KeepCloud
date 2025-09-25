import {
  FolderIcon,
  useGetFolder,
  authAtom,
  ROUTE_PATH,
  Skeleton,
  Separator,
  TooltipProviderWrapper,
} from '@keepcloud/web-core/react';
import { DayjsHelper, FileHelper } from '@keepcloud/commons/helpers';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { OwnerIcon } from '../../ui';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { SYSTEM_FILE } from '@keepcloud/commons/constants';

interface FileDetailsTabProps {
  item: FileMinViewDto;
  closeDialog?: () => void;
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

function DetailRow({ label, value, icon, className = '' }: DetailRowProps) {
  return (
    <div
      className={`flex max-w-full items-center justify-between py-3 ${className}`}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="max-w-[50%] flex-shrink-0 text-right text-sm text-heading">
        {value}
      </div>
    </div>
  );
}

export function FileDetailsTab({ item, closeDialog }: FileDetailsTabProps) {
  const authState = useAtomValue(authAtom);
  const navigate = useNavigate();

  const {
    data: parentFolder,
    isPending,
    isError,
  } = useGetFolder({
    id: item?.parentId ?? '',
    query: { withAncestors: false },
    enabled: !!item?.parentId,
  });

  const [parentUrl, setParentUrl] = useState<string | null>(null);
  const [parentName, setParentName] = useState<string | undefined>();

  useEffect(() => {
    if (!parentFolder || !item?.parentId) return;

    const isSystemFile = authState?.user.root === item?.parentId;
    if (isSystemFile) {
      setParentUrl(ROUTE_PATH.system(parentFolder?.name ?? ''));
      setParentName(
        Object.values(SYSTEM_FILE).find(
          (sys) => sys.code === parentFolder?.name,
        )?.name as string,
      );
    } else {
      setParentUrl(ROUTE_PATH.folderDetails(parentFolder?.id ?? ''));
      setParentName(parentFolder?.name);
    }
  }, [item?.parentId, authState?.user.root, parentFolder]);

  const handleNavigateToParent = () => {
    if (parentUrl) {
      navigate(parentUrl);
      closeDialog?.();
    }
  };

  if (isPending) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="py-3">
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Basic Information */}
      <DetailRow
        label="Name"
        value={
          <div className="w-full truncate font-medium" title={item.name}>
            {item.name}
          </div>
        }
      />

      {!item.isFolder && item.size && (
        <DetailRow label="Size" value={FileHelper.formatBytes(+item.size)} />
      )}

      <DetailRow
        label="Type"
        value={
          <span>
            {item.isFolder ? 'Folder' : item.format?.toUpperCase() || 'File'}
          </span>
        }
      />

      <Separator className="my-4" />

      {/* Ownership & Dates */}
      <DetailRow
        label="Owner"
        value={
          <OwnerIcon user={item.owner} withName={true} withTooltip={true} />
        }
      />

      {item.createdAt && (
        <DetailRow
          label="Created"
          value={
            <div className="text-right">
              <div>{DayjsHelper.new(item.createdAt).format('DD MMM YYYY')}</div>
              <div className="text-xs">
                {DayjsHelper.new(item.createdAt).format('HH:mm')}
              </div>
            </div>
          }
        />
      )}

      <Separator className="my-4" />

      {/* Location */}
      <DetailRow
        label="Location"
        value={
          parentUrl && parentFolder && !isError ? (
            <TooltipProviderWrapper content={`Navigate to ${parentName}`}>
              <button
                className="flex max-w-full cursor-pointer items-center gap-2"
                onClick={handleNavigateToParent}
              >
                <FolderIcon />
                <span className="truncate">{parentName}</span>
              </button>
            </TooltipProviderWrapper>
          ) : (
            <span className="text-muted-foreground">
              {isError
                ? 'Unable to load'
                : item.parentId
                  ? 'Loading...'
                  : 'Root'}
            </span>
          )
        }
      />
    </div>
  );
}
