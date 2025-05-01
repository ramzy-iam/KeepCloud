import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Checkbox,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Calendar,
  cn,
} from '@keepcloud/web-core/react';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { filterSchema, FilterFormData } from './filterSchema';

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFilters: FilterFormData;
  defaultFilters: FilterFormData;
  onApplyFilters: (filters: FilterFormData) => void;
}

export const FilterDialog = ({
  open,
  onOpenChange,
  initialFilters,
  defaultFilters,
  onApplyFilters,
}: FilterDialogProps) => {
  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      location: 'anywhere',
      inTrash: false,
      type: 'all',
      owner: 'any',
      ownerId: undefined,
      sharedWith: undefined,
      name: undefined,
      modifiedDate: undefined,
      ...initialFilters,
    },
  });

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset(initialFilters);
    }
  }, [open, initialFilters, form]);

  // Handle form submission for Confirm button
  const handleConfirm = form.handleSubmit((data) => {
    onApplyFilters(data);
    onOpenChange(false);
  });

  const handleClear = async () => {
    form.reset();
    onApplyFilters(defaultFilters);

    // Wait for the form to fully reset before closing
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left">Filters</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="anywhere">Anywhere</SelectItem>
                      <SelectItem value="my-storage">My Storage</SelectItem>
                      <SelectItem value="shared-with-me">
                        Shared with Me
                      </SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inTrash"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label="In Trash"
                    />
                  </FormControl>
                  <FormLabel className="text-14-medium text-foreground">
                    In Trash
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="folder">Folder</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value !== 'specific')
                        form.setValue('ownerId', undefined);
                    }}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Owner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">Anyone</SelectItem>
                      <SelectItem value="by-me">By Me</SelectItem>
                      <SelectItem value="not-by-me">Not By Me</SelectItem>
                      <SelectItem value="specific">Specific User</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('owner') === 'specific' && (
              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter user ID"
                        className="w-full"
                        {...field}
                        aria-label="Owner ID"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="sharedWith"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shared With</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter user email"
                      className="w-full"
                      {...field}
                      aria-label="Shared with user email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modifiedDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Modified Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="secondary"
                          className={cn(
                            'h-9 w-full px-3 py-1 pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                          aria-label="Select modified date"
                        >
                          {field.value ? (
                            format(new Date(field.value), 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(
                            date ? date.toISOString().split('T')[0] : undefined,
                          )
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4 flex justify-around">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClear}
                aria-label="Clear filters"
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirm}
                aria-label="Apply filters"
              >
                Apply Filters
              </Button>
            </div>
          </form>
        </Form>

        <DialogClose className="hidden" />
      </DialogContent>
    </Dialog>
  );
};
