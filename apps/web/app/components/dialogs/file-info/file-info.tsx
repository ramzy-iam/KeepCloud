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
} from '@keepcloud/web-core/react';
import { useAtom } from 'jotai';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { FileDetailsTab } from './file-details-tab';
import { FileActivityTab } from './file-activity-tab';

export function FileInfoDialog() {
  const [dialogState, setDialogState] = useAtom(dialogAtom);
  const { isOpen, context } = dialogState;
  const item = context?.item as FileMinViewDto | undefined;
  const FileIconComponent = useFileIcon(item);

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

          <TabsContent value="details">
            <FileDetailsTab item={item} />
          </TabsContent>

          <TabsContent value="activity">
            <FileActivityTab />
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
