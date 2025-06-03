import React, { useCallback } from 'react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { useAtom } from 'jotai';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  dialogAtom,
  useFilePreviewer,
} from '@keepcloud/web-core/react';

export const FilePreviewDialog = () => {
  const [dialogState, setDialogState] = useAtom(dialogAtom);
  const file = dialogState.context.item as FileMinViewDto;

  const { PreviewComponent, error } = useFilePreviewer({ file });

  const handleClose = useCallback(() => {
    setDialogState({ isOpen: false, type: null, context: {} });
  }, [setDialogState]);

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{file?.name || 'Aperçu du fichier'}</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[80vh] min-h-[400px] items-center justify-center overflow-auto">
          {error ? (
            <p className="text-sm text-muted-foreground">
              Impossible d'afficher un aperçu pour ce fichier.
            </p>
          ) : (
            PreviewComponent
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
