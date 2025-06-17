import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DEFAULT_ACTIVE_FOLDER,
  TreeFolderIcon,
  SidebarMenuButton,
  useGetActiveFolder,
  useGetFoldersForTree,
  useInfiniteScrollObserver,
} from '@keepcloud/web-core/react';
import { ChevronRightIcon, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { FileMinViewDto } from '@keepcloud/commons/dtos';

interface FileNodeProps {
  file: FileMinViewDto;
  icon?: React.ReactNode;
  noIcon?: boolean;
  isRoot?: boolean;
  url: string;
}

export const FileNode = ({
  file,
  icon,
  noIcon = false,
  isRoot = false,
  url,
}: FileNodeProps) => {
  const { name, id } = file;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { setActiveFolder } = useGetActiveFolder();

  const [open, setOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const {
    allPageItems: children,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetFoldersForTree({
    filters: {
      type: 'FOLDER',
      parentId: isRoot ? null : id,
    },
    enabled: open,
    staleTime: 2 * 60 * 1000, //   2 minutes to avoid frequent refetching
  });

  // Hook for intersection observer to load more
  const loadMoreRef = useInfiniteScrollObserver(
    () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    Boolean(hasNextPage),
    '100px',
  ); // load before reaching bottom

  useEffect(() => {
    setIsActive(pathname === url);
  }, [pathname, url]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  const handleNavigate = () => {
    if (isRoot) {
      setActiveFolder(DEFAULT_ACTIVE_FOLDER);
      navigate('/folders');
    } else if (id) {
      setActiveFolder({ id, name, isSystem: false });
      navigate(url);
    }
  };

  const resolvedIcon = icon ?? <TreeFolderIcon isOpen={open} />;

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="relative h-full w-[200px]"
    >
      <SidebarMenuButton
        isActive={isActive}
        className="flex w-full gap-0 hover:bg-sidebar-accent/30 dark:hover:bg-sidebar-accent/50"
        onClick={handleNavigate}
      >
        <CollapsibleTrigger asChild>
          <span
            onClick={handleToggle}
            aria-expanded={open}
            aria-label={`Toggle ${name} folder`}
          >
            <ChevronRightIcon
              width={16}
              height={16}
              className={`transition-transform ${open ? 'rotate-90' : ''}`}
            />
          </span>
        </CollapsibleTrigger>

        <div className="flex flex-1 cursor-pointer items-center gap-3 truncate pl-3">
          {!noIcon && <span>{resolvedIcon}</span>}
          <span className="truncate" title={name}>
            {name}
          </span>
        </div>
      </SidebarMenuButton>

      <CollapsibleContent className="-pl-3 relative before:absolute before:top-0 before:bottom-0 before:left-2 before:w-px before:bg-border">
        <div className="ml-2 max-h-[300px] overflow-x-hidden overflow-y-auto">
          {isLoading && !children?.length ? (
            <div className="ml-6 flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              <span>Loading</span>
            </div>
          ) : (
            <>
              {children?.map((child) => (
                <FileNode
                  key={child.id}
                  file={child}
                  url={`${url}/${child.id}`}
                />
              ))}

              {/* Sentinel div to detect scroll near bottom */}
              {hasNextPage && (
                <div
                  ref={loadMoreRef}
                  className="flex h-6 items-center justify-center"
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
