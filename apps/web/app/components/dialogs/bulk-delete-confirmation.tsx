import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  dialogAtom,
  useBulkDelete,
} from '@keepcloud/web-core/react';
import { useAtom } from 'jotai';
import { FileMinViewDto } from '@keepcloud/commons/dtos';

export function BulkDeleteConfirmationDialog() {
  const [dialogState, setDialogState] = useAtom(dialogAtom);
  const { isOpen, context } = dialogState;

  const { items, onActionComplete } = context;
  const bulkDelete = useBulkDelete();

  const handleBulkDelete = () => {
    if (items && items.length > 0) {
      const fileIds = items.map((item: FileMinViewDto) => item.id);
      bulkDelete.mutate(fileIds, {
        onSuccess: () => {
          setDialogState({ isOpen: false, type: null, context: {} });
          if (onActionComplete && typeof onActionComplete === 'function') {
            onActionComplete('delete', items);
          }
        },
      });
    }
  };

  const getItemText = () => {
    if (!items || items.length === 0) return '';

    if (items.length === 1) {
      return `"${items[0].name}"`;
    }

    return `${items.length} items`;
  };

  const getActionText = () => {
    if (!items || items.length === 0) return 'Delete';

    return items.length === 1 ? 'Delete' : `Delete ${items.length} items`;
  };

  if (!isOpen || !items || items.length === 0) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setDialogState({ isOpen: false, type: null, context: {} });
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left text-18-medium text-heading">
            Delete Permanently?
          </DialogTitle>
          <DialogDescription>
            {items.length === 1 ? (
              <>
                <strong>{getItemText()}</strong> will be permanently deleted.
                This action cannot be undone.
              </>
            ) : (
              <>
                The selected <strong>{getItemText()}</strong> will be
                permanently deleted. This action cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row justify-end space-x-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="danger"
            onClick={handleBulkDelete}
            disabled={bulkDelete.isPending}
          >
            {getActionText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
