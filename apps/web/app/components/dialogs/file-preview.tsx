import { useCallback } from 'react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { useAtom } from 'jotai';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  dialogAtom,
  useFilePreviewer,
  TooltipProviderWrapper,
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
      <DialogContent className="w-full overflow-auto md:h-[95svh] md:max-w-[60svw]!">
        <DialogHeader className="w-full max-w-full overflow-hidden text-left">
          <TooltipProviderWrapper content={file.name} sideOffset={-12}>
            <DialogTitle className="w-full max-w-full truncate p-4">
              {file.name ?? 'File Preview'}
            </DialogTitle>
          </TooltipProviderWrapper>
        </DialogHeader>

        <div className="flex max-h-[80svh] min-h-[80svh] items-center justify-center overflow-auto md:max-h-[80svh] md:p-4">
          {error ? (
            <p className="text-sm text-muted-foreground">
              No preview available for this file type or the file is not
              accessible. Please try downloading it instead.
            </p>
          ) : (
            PreviewComponent
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
