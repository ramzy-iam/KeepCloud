import { useCallback } from 'react';
import { FileMinViewDto, TrashedFileDto } from '@keepcloud/commons/dtos';
import { useAtom } from 'jotai';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  dialogAtom,
  useFilePreviewer,
  TooltipProviderWrapper,
  Button,
  useSidebar,
  cn,
  useTheme,
} from '@keepcloud/web-core/react';
import { DownloadIcon } from 'lucide-react';

const isTrashedFile = (file: FileMinViewDto): file is TrashedFileDto => {
  return 'trashedAt' in file && file.trashedAt !== null;
};

export const FilePreviewDialog = () => {
  const [dialogState, setDialogState] = useAtom(dialogAtom);
  const file = dialogState.context.item as FileMinViewDto;
  const { isMobile } = useSidebar();
  const { isDarkMode } = useTheme();

  const { PreviewComponent, error, downloadUrl } = useFilePreviewer({
    file,
  });

  const handleClose = useCallback(() => {
    setDialogState({ isOpen: false, type: null, context: {} });
  }, [setDialogState]);

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent
        hideCloseButton={isMobile}
        className="w-full gap-0 overflow-auto md:h-[95svh] md:max-w-[80svw]!"
      >
        <DialogHeader className="flex h-auto w-full max-w-full flex-row items-center justify-between gap-0 overflow-x-hidden text-left text-heading">
          <DialogDescription className="sr-only">
            Preview of the selected document.
          </DialogDescription>
          <TooltipProviderWrapper content={file.name} sideOffset={-12}>
            <DialogTitle className="w-min max-w-full truncate p-4">
              {file.name ?? 'File Preview'}
            </DialogTitle>
          </TooltipProviderWrapper>
          <div
            className={cn(
              'flex gap-6',
              !isMobile && 'mr-10',
              isMobile && 'mr-2',
            )}
          >
            <TooltipProviderWrapper content={'Download'} sideOffset={4}>
              <div>
                {downloadUrl && !isTrashedFile(file) && (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Button size="icon" variant="ghost">
                      <DownloadIcon className="h-5 w-5" />
                    </Button>
                  </a>
                )}
              </div>
            </TooltipProviderWrapper>
          </div>
        </DialogHeader>

        <div className="flex max-h-[70svh] min-h-[70svh] items-center justify-center overflow-auto md:max-h-[80svh] md:min-h-[80svh] md:p-4">
          {isTrashedFile(file) ? (
            <p className="text-sm text-muted-foreground">
              This file is in the trash. Please restore it first before
              previewing.
            </p>
          ) : error ? (
            <p className="text-sm text-muted-foreground">
              No preview available for this file type or the file is not
              accessible. Please try downloading it instead.
            </p>
          ) : (
            PreviewComponent
          )}
        </div>

        {isMobile && (
          <DialogFooter className="mt-4 w-full max-w-full px-4">
            <Button
              variant={isDarkMode ? 'primary' : 'outline'}
              className="w-full"
              onClick={handleClose}
            >
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
