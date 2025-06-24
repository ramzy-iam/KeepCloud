import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  DialogClose,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  dialogAtom,
  DialogDescription,
  useFileIcon,
  useGetFolder,
  authAtom,
  ROUTE_PATH,
  FolderIcon,
} from '@keepcloud/web-core/react';
import { useAtom, useAtomValue } from 'jotai';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { DayjsHelper, FileHelper } from '@keepcloud/commons/helpers';
import { OwnerIcon } from '../../ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export function FileInfoDialog() {
  const [dialogState, setDialogState] = useAtom(dialogAtom);
  const { isOpen, context } = dialogState;
  const item = context?.item as FileMinViewDto | undefined;
  const FileIconComponent = useFileIcon(item);
  const authState = useAtomValue(authAtom);
  const navigate = useNavigate();

  const { data: parentFolder, isPending } = useGetFolder({
    id: item?.parentId ?? '',
    query: { withAncestors: false },
    enabled: !!item?.parentId,
  });
  const [parentUrl, setParentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (parentFolder) return;
    const isSystemFile = authState?.user.root === item?.parentId;
    if (isSystemFile) {
      setParentUrl(ROUTE_PATH.system(item?.parentId ?? ''));
    } else {
      setParentUrl(ROUTE_PATH.folderDetails(item?.parentId ?? ''));
    }
  }, [parentFolder]);

  if (!item) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setDialogState({ isOpen: false, type: null, context: {} });
      }}
    >
      <DialogHeader>
        <DialogTitle className="sr-only">File Information</DialogTitle>
        <DialogDescription className="sr-only"></DialogDescription>
      </DialogHeader>

      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <div className="border-b px-6 py-4">
          <div className="flex items-center space-x-3">
            {FileIconComponent && <FileIconComponent />}
            <div className="max-w-[calc(100%-40px)] truncate text-base font-medium">
              {item.name}
            </div>
          </div>
        </div>

        <Tabs defaultValue="details" className="min-h-[248px] px-6 pt-2 pb-4">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">Name</span> <span>{item.name}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">Type</span>
              <span>
                {item.isFolder ? 'Folder' : item.format?.toUpperCase()}
              </span>
            </div>
            {!item.isFolder && (
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">Size</span>
                <span>
                  {item.size ? FileHelper.formatBytes(+item.size) : '-'}
                </span>
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
              {parentUrl && (
                <button
                  className="flex max-w-[200px] cursor-pointer gap-3 truncate text-right"
                  onClick={() => navigate(parentUrl)}
                >
                  <FolderIcon /> <span>{parentFolder?.name}</span>
                </button>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="activity"
            className="text-sm text-muted-foreground"
          >
            <div className="flex h-full w-full items-center justify-center py-2">
              No activity yet
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="justify-end px-6 pb-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
