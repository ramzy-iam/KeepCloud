import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  useGetKeyToInvalidateBasedOnActiveFolder,
  dialogAtom,
  useRenameResource,
} from '@keepcloud/web-core/react';
import { useAtom } from 'jotai';
import { useEffect } from 'react';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type FormInput = z.infer<typeof schema>;

export const RenameResourceDialog = () => {
  const [dialogState, setDialogState] = useAtom(dialogAtom);
  const { isOpen, type, context } = dialogState;
  const keyToInvalidate = useGetKeyToInvalidateBasedOnActiveFolder();

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: context.item?.name || '',
    },
  });

  const renameResource = useRenameResource({
    keysToInvalidate: [keyToInvalidate],
    resourceName: context.item?.contentType === 'folder' ? 'Folder' : 'File',
  });

  const onSubmit = (data: FormInput) => {
    if (context.item) {
      renameResource.mutate(
        {
          id: context.item.id,
          name: data.name,
        },
        {
          onSuccess: () => {
            setDialogState({ isOpen: false, type: null, context: {} });
            form.reset();
          },
        },
      );
    }
  };

  useEffect(() => {
    if (context.item) {
      form.reset({
        name: context.item.name,
      });
    }
  }, [context.item]);

  if (!isOpen || type !== 'rename' || !context.item) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) =>
        setDialogState((prev) => ({
          ...prev,
          isOpen: open,
          type: open ? prev.type : null,
          context: open ? prev.context : {},
        }))
      }
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left text-18-medium text-heading">
            Rename
          </DialogTitle>
          <DialogDescription className="sr-only">
            Rename "{context.item.name}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Type a name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-row justify-end space-x-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={renameResource.isPending}>
                Rename
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
