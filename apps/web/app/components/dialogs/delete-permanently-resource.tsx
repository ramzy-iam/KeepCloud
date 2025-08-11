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
  useDeletePermanently,
} from '@keepcloud/web-core/react';
import { useAtom } from 'jotai';

export function DeletePermanentlyDialog() {
  const [dialogState, setDialogState] = useAtom(dialogAtom);
  const { isOpen, context } = dialogState;

  const { item: file } = context;

  const deleteMutation = useDeletePermanently();

  const handleDelete = () => {
    if (file?.id)
      deleteMutation.mutate(
        file.id,

        {
          onSuccess: () => {
            setDialogState({ isOpen: false, type: null, context: {} });
          },
        },
      );
  };

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
            Delete Permanently ?
          </DialogTitle>
          <DialogDescription>
            <strong>"{file?.name}" </strong> will be permanently deleted. This
            action cannot be undone.
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
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
