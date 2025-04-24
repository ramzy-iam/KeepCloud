'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  FileTextIcon,
  FunnelIcon,
  MoreVertical,
  SearchIcon,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Info,
  Link,
  Move,
  PenLine,
  Pin,
  Share2,
  Star,
  Trash2,
  UserCog,
  Activity,
  Eye,
} from 'lucide-react';

import { filesize } from 'filesize';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
  Checkbox,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Avatar,
  AvatarImage,
  AvatarFallback,
  cn,
} from '@keepcloud/web-core/react';
import { DayjsHelper, NameFormatterHelper } from '@keepcloud/commons/helpers';

const FolderIconOutline = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.6667 7.33337V11.3334C14.6667 14 14 14.6667 11.3333 14.6667H4.66668C2.00001 14.6667 1.33334 14 1.33334 11.3334V4.66671C1.33334 2.00004 2.00001 1.33337 4.66668 1.33337H5.66668C6.66668 1.33337 6.88668 1.62671 7.26668 2.13337L8.26668 3.46671C8.52001 3.80004 8.66668 4.00004 9.33334 4.00004H11.3333C14 4.00004 14.6667 4.66671 14.6667 7.33337Z"
      stroke="#FFCA28"
      strokeWidth="1.2"
      strokeMiterlimit="10"
    />
    <path
      d="M5.33334 1.33337H11.3333C12.6667 1.33337 13.3333 2.00004 13.3333 3.33337V4.25337"
      stroke="#FFCA28"
      strokeWidth="1.2"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RenameIcon = () => (
  <svg
    width="18"
    height="19"
    viewBox="0 0 18 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.75 5.75012H3.9C3.05992 5.75012 2.63988 5.75012 2.31901 5.91361C2.03677 6.05742 1.8073 6.28689 1.66349 6.56914C1.5 6.89 1.5 7.31004 1.5 8.15012V10.8501C1.5 11.6902 1.5 12.1102 1.66349 12.4311C1.8073 12.7134 2.03677 12.9428 2.31901 13.0866C2.63988 13.2501 3.05992 13.2501 3.9 13.2501H9.75M12.75 5.75012H14.1C14.9401 5.75012 15.3601 5.75012 15.681 5.91361C15.9632 6.05742 16.1927 6.28689 16.3365 6.56914C16.5 6.89 16.5 7.31004 16.5 8.15012V10.8501C16.5 11.6902 16.5 12.1102 16.3365 12.4311C16.1927 12.7134 15.9632 12.9428 15.681 13.0866C15.3601 13.2501 14.9401 13.2501 14.1 13.2501H12.75M12.75 16.2501L12.75 2.75012M14.625 2.75013L10.875 2.75012M14.625 16.2501L10.875 16.2501"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const data: File[] = [
  {
    id: 'file_01hzyvffsdvwb4xyqz6a2cbx0g',
    name: 'Project_Plan.pdf',
    sharedBy: {
      id: 'user_01hzyvffsdvwb4xyqz6a2cbx0g',
      firstName: 'John',
      lastName: 'Doe',
      picture: 'https://picsum.photos/200/300',
    },
    size: 102400,
    lastModified: '2025-04-18T15:42:10Z',
  },
  {
    id: 'file_01hzyvgg1xwff8ypr3d9ka5t2v',
    name: 'Budget_2025.xlsx',
    sharedBy: {
      id: 'user_01hzyvgg1xwff8ypr3d9ka5t2v',
      firstName: 'Jane',
      lastName: 'Smith',
      picture: 'https://picsum.photos/200/301',
    },
    size: 204800,
    lastModified: '2025-04-17T10:15:00Z',
  },
  {
    id: 'file_01hzyvhjk88pwxz7rft5lku90g',
    name: 'Meeting_Notes.docx',
    sharedBy: null,
    size: 51200,
    lastModified: '2025-04-15T08:30:00Z',
  },
  {
    id: 'file_01hzyvhrstqubyz3kjqh8twa9c',
    name: 'Design_Mockup.fig',
    sharedBy: {
      id: 'user_01hzyvhrstqubyz3kjqh8twa9c',
      firstName: 'Bob',
      lastName: 'Taylor',
      picture: 'https://picsum.photos/200/303',
    },
    size: 153600,
    lastModified: '2025-04-14T14:25:00Z',
  },
  {
    id: 'file_01hzyvjmqp2qwbw8vxytgrza5m',
    name: 'Sprint Backlog',
    sharedBy: {
      id: 'user_01hzyvjmqp2qwbw8vxytgrza5m',
      firstName: 'Carol',
      lastName: 'White',
      picture: 'https://picsum.photos/200/304',
    },
    isFolder: true,
    size: 30720,
    lastModified: '2025-04-13T16:45:00Z',
  },
  {
    id: 'file_01hzyvkp9nd5asld0yejz3ah2p',
    name: 'Contract_Agreement.pdf',
    sharedBy: {
      id: 'user_01hzyvkp9nd5asld0yejz3ah2p',
      firstName: 'Dan',
      lastName: 'Green',
      picture: 'https://picsum.photos/200/305',
    },
    size: 256000,
    lastModified: '2025-04-12T12:00:00Z',
  },
  {
    id: 'file_01hzyvm5tvs8fz60n7u4mc6xqy',
    name: 'Team_Photo.png',
    sharedBy: {
      id: 'user_01hzyvm5tvs8fz60n7u4mc6xqy',
      firstName: 'Eva',
      lastName: 'Martinez',
      picture: 'https://picsum.photos/200/306',
    },
    size: 1024000,
    lastModified: '2025-04-11T09:20:00Z',
  },
  {
    id: 'file_01hzyvn8szwljd6eb3zxtak2qk',
    name: 'Roadmap_2025.pptx',
    sharedBy: {
      id: 'user_01hzyvn8szwljd6eb3zxtak2qk',
      firstName: 'Frank',
      lastName: 'Wilson',
      picture: 'https://picsum.photos/200/307',
    },
    size: 512000,
    lastModified: '2025-04-10T13:15:00Z',
  },
  {
    id: 'file_01hzyvp25jsdkfju7a0mhzz75n',
    name: 'Sales_Report_Q1.pdf',
    sharedBy: {
      id: 'user_01hzyvp25jsdkfju7a0mhzz75n',
      firstName: 'Grace',
      lastName: 'Nguyen',
      picture: 'https://picsum.photos/200/308',
    },
    size: 409600,
    lastModified: '2025-04-09T07:50:00Z',
  },
  {
    id: 'file_01hzyvqabc8m4kvq9mzt7tw5yw',
    name: 'Technical_Specs.md',
    sharedBy: {
      id: 'user_01hzyvqabc8m4kvq9mzt7tw5yw',
      firstName: 'Henry',
      lastName: 'Lopez',
      picture: 'https://picsum.photos/200/309',
    },
    size: 10240,
    lastModified: '2025-04-08T18:35:00Z',
  },
  {
    id: 'file_01hzyvrtdvq3nep8hz3ke4x56q',
    name: 'Wireframe_Sketch.sketch',
    sharedBy: {
      id: 'user_01hzyvrtdvq3nep8hz3ke4x56q',
      firstName: 'Ivy',
      lastName: 'Khan',
      picture: 'https://picsum.photos/200/310',
    },
    size: 768000,
    lastModified: '2025-04-07T20:15:00Z',
  },
  {
    id: 'file_01hzyvt53txxwvqp6d09gh56g2',
    name: 'Customer_Feedback.xlsx',
    sharedBy: {
      id: 'user_01hzyvt53txxwvqp6d09gh56g2',
      firstName: 'Jack',
      lastName: 'Lee',
      picture: 'https://picsum.photos/200/311',
    },
    size: 153600,
    lastModified: '2025-04-06T11:10:00Z',
  },
  {
    id: 'file_01hzyvv7afg82mzq2r4s3deukx',
    name: 'QA_Results.docx',
    sharedBy: {
      id: 'user_01hzyvv7afg82mzq2r4s3deukx',
      firstName: 'Kate',
      lastName: 'Patel',
      picture: 'https://picsum.photos/200/312',
    },
    size: 204800,
    lastModified: '2025-04-05T17:00:00Z',
  },
  {
    id: 'file_01hzyvwgj9pnz0mx7tk4edwzxr',
    name: 'Marketing_Plan.pptx',
    sharedBy: {
      id: 'user_01hzyvwgj9pnz0mx7tk4edwzxr',
      firstName: 'Leo',
      lastName: 'Kim',
      picture: 'https://picsum.photos/200/313',
    },
    size: 307200,
    lastModified: '2025-04-04T14:55:00Z',
  },
  {
    id: 'file_01hzyvxxd7zpjrdke5t2b8g2ma',
    name: 'Launch_Checklist.txt',
    sharedBy: {
      id: 'user_01hzyvxxd7zpjrdke5t2b8g2ma',
      firstName: 'Mia',
      lastName: 'Ahmed',
      picture: 'https://picsum.photos/200/314',
    },
    size: 5120,
    lastModified: '2025-04-03T10:05:00Z',
  },
];

export type File = {
  id: string;
  name: string;
  sharedBy: {
    id: string;
    firstName: string;
    lastName: string;
    picture: string;
  } | null;
  isFolder?: boolean;
  size: number;
  lastModified: string;
};

export const columns: ColumnDef<File>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const isFolder = row.original.isFolder;
      return (
        <div className="flex items-center gap-2 truncate text-14-medium text-secondary-foreground">
          {isFolder ? (
            <FolderIconOutline />
          ) : (
            <FileTextIcon size={16} className="text-app-accent" />
          )}
          <div>{row.getValue('name')}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'sharedBy',
    header: 'Shared By',
    cell: ({ row }) => {
      const sharedBy = row.getValue('sharedBy') as File['sharedBy'];
      if (!sharedBy)
        return (
          <div className="text-center text-secondary-foreground md:text-left">
            -
          </div>
        );
      return (
        <div className="flex items-center gap-2 capitalize">
          <Avatar className={cn('h-[24px] w-[24px]')}>
            <AvatarImage src={sharedBy.picture} />
            <AvatarFallback>
              {NameFormatterHelper.format(
                [sharedBy.firstName, sharedBy.lastName],
                'initials',
              )}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-14-medium text-secondary-foreground">
            {sharedBy.firstName} {sharedBy.lastName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'size',
    header: () => <div className="text-right">Size</div>,
    cell: ({ row }) => {
      const formatted = filesize(row.getValue('size'));
      return (
        <div className="truncate text-right text-14-medium text-secondary-foreground">
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: 'lastModified',
    header: () => <div className="text-right">Last Modified</div>,
    cell: ({ row }) => {
      const formatted = DayjsHelper.new(row.getValue('lastModified')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
      return (
        <div className="truncate text-right text-14-medium text-secondary-foreground">
          {formatted}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-center">Actions</div>,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size={'icon'} className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[285px] p-2">
              <DropdownMenuLabel className="mb-3 text-14-medium">
                {row.getValue('name')}
              </DropdownMenuLabel>
              <DropdownMenuItem className="flex cursor-pointer items-center stroke-neutral-300 py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:stroke-200 dark:text-neutral-200 dark:hover:text-neutral-200">
                <Info className="mr-2 h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
                <span>Info</span>
                <ChevronRight className="ml-auto h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
              </DropdownMenuItem>

              <DropdownMenuItem className="flex cursor-pointer items-center stroke-neutral-300 py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:stroke-200 dark:text-neutral-200 dark:hover:text-neutral-200">
                <ExternalLink className="mr-2 h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
                <span>Open in</span>
                <ChevronRight className="ml-auto h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
              </DropdownMenuItem>

              <DropdownMenuItem className="flex cursor-pointer items-center stroke-neutral-300 py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:stroke-200 dark:text-neutral-200 dark:hover:text-neutral-200">
                <Share2 className="mr-2 h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
                <span>Share</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex cursor-pointer items-center stroke-neutral-300 py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:stroke-200 dark:text-neutral-200 dark:hover:text-neutral-200">
                <Link className="mr-2 h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
                <span>Copy link</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex cursor-pointer items-center stroke-neutral-300 py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:stroke-200 dark:text-neutral-200 dark:hover:text-neutral-200">
                <UserCog className="mr-2 h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
                <span>Manage permissions</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex cursor-pointer items-center stroke-neutral-300 py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:stroke-200 dark:text-neutral-200 dark:hover:text-neutral-200">
                <Download className="mr-2 h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
                <span>Download</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="mt-2" />
              <DropdownMenuItem className="flex cursor-pointer items-center stroke-neutral-300 py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:stroke-200 dark:text-neutral-200 dark:hover:text-neutral-200">
                <span className="mr-2 stroke-neutral-300! hover:stroke-neutral-300! dark:stroke-200 dark:hover:stroke-neutral-200">
                  <RenameIcon />
                </span>
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex cursor-pointer items-center py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:text-neutral-200 dark:hover:text-neutral-200">
                <Copy className="mr-2 h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
                <span>Copy</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex cursor-pointer items-center stroke-neutral-300 py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:stroke-200 dark:text-neutral-200 dark:hover:text-neutral-200">
                <Move className="mr-2 h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
                <span>Move</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex cursor-pointer items-center py-2 text-error-500 hover:text-error-500!">
                <Trash2 className="mr-2 h-4 w-4 text-error-500 hover:text-error-500 dark:hover:text-neutral-200" />
                <span>Delete</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="mt-2" />
              <DropdownMenuItem className="flex cursor-pointer items-center stroke-neutral-300 py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:stroke-200 dark:text-neutral-200 dark:hover:text-neutral-200">
                <Star className="mr-2 h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
                <span>Star</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex cursor-pointer items-center stroke-neutral-300 py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:stroke-200 dark:text-neutral-200 dark:hover:text-neutral-200">
                <Pin className="mr-2 h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
                <span>Pin to KeepCloud</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex cursor-pointer items-center stroke-neutral-300 py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:stroke-200 dark:text-neutral-200 dark:hover:text-neutral-200">
                <Eye className="mr-2 h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
                <span>Show pinned items</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex cursor-pointer items-center stroke-neutral-300 py-2 text-neutral-300! hover:bg-foreground hover:text-neutral-300 dark:stroke-200 dark:text-neutral-200 dark:hover:text-neutral-200">
                <Activity className="mr-2 h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
                <span>Activity</span>
                <ChevronRight className="ml-auto h-4 w-4 text-neutral-300 hover:text-neutral-300 dark:hover:text-neutral-200" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <div className="relative">
            <div className="absolute top-2 left-2.5 h-4 w-4 text-muted-foreground">
              <SearchIcon className="h-4 w-4" />
            </div>
            <Input
              type="search"
              placeholder="Search..."
              // value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
              // onChange={(event) =>
              //   table.getColumn('email')?.setFilterValue(event.target.value)
              // }
              className="h-8 w-full max-w-sm rounded-lg bg-background pl-8 placeholder:text-12!"
            />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="ml-auto h-8 w-8 px-0 md:h-[32px] md:w-[85px]"
            >
              <FunnelIcon />
              <span className="hidden md:inline">Filters</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-stroke-50 hover:bg-stroke-50 dark:bg-neutral-800 dark:hover:bg-neutral-800"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
