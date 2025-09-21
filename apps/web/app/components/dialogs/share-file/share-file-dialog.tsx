import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  dialogAtom,
  Skeleton,
  useGetFolder,
  useGetFile,
} from '@keepcloud/web-core/react';
import { useAtom } from 'jotai';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { SharePeopleTab } from './share-people-tab';
import { X } from 'lucide-react';

export function ShareFileDialog() {
  const [dialogState, setDialogState] = useAtom(dialogAtom);
  const { isOpen, context } = dialogState;
  const item = context?.item as FileMinViewDto | undefined;

  // Fetch detailed information based on whether it's a folder or file
  const {
    data: folderDetails,
    isLoading: folderLoading,
    error: folderError,
  } = useGetFolder({
    id: item?.id || '',
    enabled: !!item && item.isFolder && dialogState.type === 'shareFile',
  });

  const {
    data: fileDetails,
    isLoading: fileLoading,
    error: fileError,
  } = useGetFile({
    id: item?.id || '',
    enabled: !!item && !item.isFolder && dialogState.type === 'shareFile',
  });

  const detailedItem = item?.isFolder ? folderDetails : fileDetails;
  const isLoading = item?.isFolder ? folderLoading : fileLoading;
  const error = item?.isFolder ? folderError : fileError;

  const closeDialog = () =>
    setDialogState({ isOpen: false, type: null, context: {} });

  if (!item || dialogState.type !== 'shareFile') return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeDialog();
      }}
    >
      <DialogContent
        hideCloseButton={true}
        className="flex flex-col gap-4 overflow-hidden p-0 sm:max-w-2xl"
      >
        <DialogHeader className="px-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <DialogTitle className="text-left text-lg font-semibold">
                  Share {item.isFolder ? 'Folder' : 'File'} "{item.name}"
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {item.isFolder ? 'Folder' : 'File'} • Owned by{' '}
                  {item.owner.firstName} {item.owner.lastName}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeDialog}
              className="h-8 w-8 rounded-md"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 px-6 pb-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="mb-3 h-4 w-1/4" />
              <Skeleton className="mb-2 h-3 w-full" />
              <Skeleton className="mb-4 h-3 w-3/4" />
              <Skeleton className="mb-3 h-10 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="mb-2">
                Failed to load {item.isFolder ? 'folder' : 'file'} details
              </p>
              <p className="text-sm text-gray-500">Please try again later</p>
            </div>
          ) : detailedItem ? (
            <SharePeopleTab item={detailedItem} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
