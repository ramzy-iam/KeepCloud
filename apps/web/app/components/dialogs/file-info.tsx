import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  DialogClose,
  dialogAtom,
} from '@keepcloud/web-core/react';
import { useAtom } from 'jotai';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { title } from 'radash';
import { FileHelper } from '@keepcloud/commons/helpers';

export function FileInfoDialog() {
  const [dialogState, setDialogState] = useAtom(dialogAtom);
  const { isOpen, context } = dialogState;
  const item = context?.item as FileMinViewDto | undefined;

  if (!item) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setDialogState({ isOpen: false, type: null, context: {} });
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left text-18-medium text-heading">
            {item.isFolder ? 'Folder Info' : 'File Info'}
          </DialogTitle>
          <DialogDescription>
            Details for <strong>{item.name}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2 text-sm">
          <div>
            <span className="font-medium">Name:</span> {item.name}
          </div>
          <div>
            <span className="font-medium">Type:</span>{' '}
            {item.isFolder ? 'Folder' : item.format}
          </div>
          {!item.isFolder && (
            <div>
              <span className="font-medium">Size:</span>{' '}
              {item.size ? FileHelper.formatBytes(+item.size) : '-'}
            </div>
          )}
          <div>
            <span className="font-medium">Owner:</span>{' '}
            {title(`${item.owner.firstName} ${item.owner.lastName}`) ?? '-'}
          </div>
        </div>
        <DialogFooter className="flex-row justify-end space-x-2">
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
