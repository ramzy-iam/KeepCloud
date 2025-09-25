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
  useCreateFolder,
  useGetActiveFolder,
  dialogAtom,
  authAtom,
  useDialogFocus,
} from '@keepcloud/web-core/react';
import { useAtom, useAtomValue } from 'jotai';
import { FileHelper } from '@keepcloud/commons/helpers';

const schema = z.object({
  name: z.string().min(1, 'Folder name is required'),
});

type FormInput = z.infer<typeof schema>;

export function CreateFolderDialog() {
  const [dialogState, setDialogState] = useAtom(dialogAtom);
  const { activeFolder } = useGetActiveFolder();
  const { isOpen, type, context } = dialogState;
  const auth = useAtomValue(authAtom);
  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: 'Untitled folder',
    },
  });

  const createFolder = useCreateFolder({ parentId: activeFolder.id });

  const onSubmit = (data: FormInput) => {
    const parentId = FileHelper.getValidParentId(context.folderId);

    createFolder.mutate(
      {
        name: data.name,
        parentId,
        ownerId: auth?.user?.id as string,
      },
      {
        onSuccess: () => {
          setDialogState({ isOpen: false, type: null, context: {} });
          form.reset();
        },
      },
    );
  };

  // Use the reusable hook for dialog focus
  useDialogFocus({
    isOpen,
    dialogType: type,
    expectedType: 'createFolder',
    form,
    fieldName: 'name',
    shouldSelect: true,
  });

  if (!isOpen || type !== 'createFolder') return null;

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
            Create Folder
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create a new folder in the current directory
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
                    <Input
                      placeholder="Enter a name"
                      {...field}
                      autoFocus={true}
                    />
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
              <Button type="submit" disabled={createFolder.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
