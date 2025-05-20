import * as React from 'react';
import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  cn,
} from '@keepcloud/web-core/react';
import { Search, Funnel, FunnelX, FileTextIcon } from 'lucide-react';
import { files as data } from '@keepcloud/commons/types';
import { FilterDialog } from './FilterDialog';
import { FilterFormData } from './filterSchema';
import { FolderIconOutline } from '../folder-icon';

const filterInitialValues: FilterFormData = {
  location: 'anywhere',
  inTrash: false,
  type: 'all',
  owner: 'any',
  ownerId: undefined,
  sharedWith: '',
  name: undefined,
  modifiedDate: undefined,
};

export const GlobalSearch = () => {
  const [open, setOpen] = React.useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState<FilterFormData>({
    ...filterInitialValues,
  });

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Clear filters when command dialog closes
  const handleCommandDialogOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFilters({ ...filterInitialValues });
      setQuery('');
    }
  };

  // Filter data based on applied filters
  const currentUserId = 'user-id-placeholder';
  const filteredData = data.filter((item) => {
    const matchesQuery = query
      ? item.name.toLowerCase().includes(query.toLowerCase())
      : true;
    const matchesLocation =
      filters.location === 'my-storage'
        ? item.owner.id === currentUserId
        : filters.location === 'shared-with-me'
          ? item.owner.id !== currentUserId
          : true;
    const matchesInTrash = filters.inTrash ? item.isTrashed : true;
    const matchesType =
      filters.type === 'all' ||
      (filters.type === 'folder' && item.isFolder) ||
      (filters.type === 'file' && item.fileType === 'file') ||
      (filters.type === 'image' && item.fileType === 'image') ||
      (filters.type === 'video' && item.fileType === 'video');
    const matchesOwner =
      filters.owner === 'by-me'
        ? item.owner.id === currentUserId
        : filters.owner === 'not-by-me'
          ? item.owner.id !== currentUserId
          : filters.ownerId
            ? item.owner.id === filters.ownerId
            : true;
    const matchesSharedWith = filters.sharedWith
      ? item.sharedWith?.includes(filters.sharedWith)
      : true;
    const matchesName = filters.name
      ? item.name.toLowerCase().includes(filters.name.toLowerCase())
      : true;
    const matchesModifiedDate = filters.modifiedDate
      ? new Date(item.lastModified).toISOString().split('T')[0] ===
        filters.modifiedDate
      : true;

    return (
      matchesQuery &&
      matchesLocation &&
      matchesInTrash &&
      matchesType &&
      matchesOwner &&
      matchesSharedWith &&
      matchesName &&
      matchesModifiedDate
    );
  });

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const currentValue = filters[key as keyof FilterFormData];
    const initialValue = filterInitialValues[key as keyof FilterFormData];
    return (
      currentValue !== initialValue &&
      !(currentValue === '' && initialValue === undefined)
    );
  });

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="flex cursor-pointer items-center gap-2.5 rounded-[8px] border border-transparent px-[24px] py-[13px] text-14 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none md:w-[300px] xl:w-[400px] 2xl:w-[500px] dark:hover:border-primary dark:focus:border-primary dark:focus:ring-primary/50"
      >
        <Search className="text-foreground" size={16} />
        <span className="text-placeholder">What are you looking for?</span>
      </button>

      <CommandDialog open={open} onOpenChange={handleCommandDialogOpenChange}>
        <div className="flex items-center gap-2 border-b p-2">
          <Button
            onClick={() => setFilterDialogOpen(true)}
            variant="outline"
            size={'icon'}
            aria-label={
              hasActiveFilters ? 'Clear filters' : 'Open filter options'
            }
          >
            {hasActiveFilters ? (
              <FunnelX className={cn('h-5 w-5 text-foreground')} />
            ) : (
              <Funnel className={cn('h-5 w-5 text-foreground')} />
            )}
          </Button>
        </div>
        <CommandInput
          placeholder="Type to search..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {filteredData?.length > 0 && (
            <CommandGroup heading="Results">
              {filteredData.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    {item.isFolder ? (
                      <FolderIconOutline />
                    ) : (
                      <FileTextIcon size={16} className="text-app-accent" />
                    )}
                    <span>{item.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>

      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        initialFilters={filters}
        defaultFilters={filterInitialValues}
        onApplyFilters={setFilters}
      />
    </div>
  );
};
