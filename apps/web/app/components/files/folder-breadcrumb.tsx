import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  BreadcrumbEllipsis,
  useSidebar,
  ROUTE_PATH,
} from '@keepcloud/web-core/react';
import { useNavigate } from 'react-router';
import { FileAncestor, FileMinViewDto } from '@keepcloud/commons/dtos';

interface FolderBreadcrumbProps {
  folder: FileMinViewDto;
  onBreadcrumbClick?: (ancestor: FileAncestor) => void;
}

export const FolderBreadcrumb = ({
  folder,
  onBreadcrumbClick,
}: FolderBreadcrumbProps) => {
  const navigate = useNavigate();
  const ancestors = folder.ancestors ?? [];
  const { isMobile } = useSidebar();

  // Show ellipsis if:
  // - on mobile with any ancestors
  // - on desktop with more than 2 ancestors
  const shouldShowEllipsis = isMobile
    ? ancestors.length > 0
    : ancestors.length > 2;

  const visibleAncestors: FileAncestor[] = shouldShowEllipsis
    ? isMobile
      ? [] // hide all on mobile
      : ancestors.slice(-1) // show last on desktop
    : ancestors; // show all if 2 or fewer ancestors

  const hiddenAncestors: FileAncestor[] = shouldShowEllipsis
    ? isMobile
      ? ancestors
      : ancestors.slice(0, -1)
    : [];

  return (
    <Breadcrumb className="w-[90%]">
      <BreadcrumbList>
        {/* Dropdown if there are hidden ancestors */}
        {hiddenAncestors.length > 0 && (
          <>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1 rounded-[16px] px-1 text-20-medium text-heading hover:bg-stroke-200 dark:hover:bg-white/5">
                  <BreadcrumbEllipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[150px]">
                  {hiddenAncestors.map((ancestor) => (
                    <DropdownMenuItem
                      key={ancestor.id}
                      className="cursor-pointer"
                      asChild
                      onClick={() => {
                        onBreadcrumbClick && onBreadcrumbClick(ancestor);
                      }}
                    >
                      <span>{ancestor.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        {/* Visible ancestors */}
        {visibleAncestors.map((ancestor) => (
          <React.Fragment key={ancestor.id}>
            <BreadcrumbItem
              className="cursor-pointer rounded-[16px] px-4 py-1 text-heading hover:bg-stroke-200 dark:hover:bg-white/5"
              onClick={() => {
                onBreadcrumbClick && onBreadcrumbClick(ancestor);
              }}
            >
              <h4 className="truncate text-20-medium" title={ancestor.name}>
                {ancestor.name}
              </h4>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </React.Fragment>
        ))}

        {/* Current folder */}
        <BreadcrumbItem className="max-w-[70%] md:max-w-[80%]">
          <BreadcrumbPage className="truncate">
            <h4
              className="truncate text-20-medium text-heading"
              title={folder.name}
            >
              {folder.name}
            </h4>
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
