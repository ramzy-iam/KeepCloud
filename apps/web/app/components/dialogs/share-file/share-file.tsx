import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  dialogAtom,
} from '@keepcloud/web-core/react';
import { useAtom } from 'jotai';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { SharePeopleTab } from './share-people-tab';
import { ShareLinkTab } from './share-link-tab';
import { X } from 'lucide-react';

export function ShareFileDialog() {
  const [dialogState, setDialogState] = useAtom(dialogAtom);
  const { isOpen, context } = dialogState;
  const item = context?.item as FileMinViewDto | undefined;

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
        className="flex flex-col overflow-hidden p-0 sm:max-w-2xl"
      >
        <DialogHeader className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <DialogTitle className="text-left text-lg font-semibold">
                  Share {item.isFolder ? 'Folder' : 'File'} "{item.name}"
                </DialogTitle>
                <DialogDescription className="sr-only text-sm text-muted-foreground">
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

        <div className="flex-1 px-6 py-4">
          <Tabs defaultValue="people" className="h-full">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="people" className="text-sm">
                Share with people
              </TabsTrigger>
              <TabsTrigger value="link" className="text-sm">
                Get link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="people" className="mt-0 space-y-4">
              <SharePeopleTab item={item} />
            </TabsContent>

            <TabsContent value="link" className="mt-0 space-y-4">
              <ShareLinkTab item={item} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
