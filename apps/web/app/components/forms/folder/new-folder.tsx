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
  useGetActiveFolder,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useCreateFolder,
  useGetKeyToInvalidateBasedOnActiveFolder,
} from '@keepcloud/web-core/react';

const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
});

type CreateFolderInput = z.infer<typeof createFolderSchema>;

interface AddFolderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFolderFormDialog({
  open,
  onOpenChange,
}: AddFolderFormDialogProps) {
  const { activeFolder } = useGetActiveFolder();
  const keyToInvalidate = useGetKeyToInvalidateBasedOnActiveFolder();
  const form = useForm<CreateFolderInput>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      name: '',
    },
  });

  const createFolder = useCreateFolder({
    keyToInvalidate,
  });

  const onSubmit = (data: CreateFolderInput) => {
    const parentId =
      activeFolder?.id == 'null' ? undefined : (activeFolder?.id ?? undefined);
    createFolder.mutate(
      {
        name: data.name,
        parentId,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  <FormLabel>Folder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter folder name" {...field} />
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
