import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  useSidebar,
  HoverCardTrigger,
  HoverCard,
  HoverCardContent,
  ROUTE_PATH,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@keepcloud/web-core/react';
import { useNavigate } from 'react-router';
import { FileAncestor, FileMinViewDto } from '@keepcloud/commons/dtos';
import { FolderIconOutline } from '../ui';

interface FileLocationBreadcrumbHoverProps {
  folder: FileMinViewDto;
  className?: string;
  onBreadcrumbClick?: (ancestor: FileAncestor) => void;
}

const MiniBreadcrumb = ({
  folder,
  onBreadcrumbClick,
}: FileLocationBreadcrumbHoverProps) => {
  const ancestors = folder.ancestors ?? [];
  const [expanded, setExpanded] = React.useState(false);
  const navigate = useNavigate();
  const listRef = React.useRef<HTMLOListElement | null>(null);

  const defaultOnClick = (ancestor: FileAncestor) => {
    const route = ancestor.isSystem
      ? ROUTE_PATH.system(ancestor.code)
      : ROUTE_PATH.folderDetails(ancestor.id);
    navigate(route);
  };

  const handleClick = (ancestor: FileAncestor) => {
    onBreadcrumbClick ? onBreadcrumbClick(ancestor) : defaultOnClick(ancestor);
  };

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        left: listRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [expanded]);

  const renderCollapsed = () => {
    const first = ancestors[0];
    const last = ancestors[ancestors.length - 1];

    return (
      <>
        <BreadcrumbItem
          onClick={(e) => {
            e.stopPropagation();
            handleClick(first);
          }}
          className="cursor-pointer items-center gap-2 rounded-[16px] px-4 py-2 text-heading hover:bg-stroke-200 dark:hover:bg-white/5"
        >
          <FolderIconOutline />
          {first.name}
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
          }}
          className="flex cursor-pointer items-center gap-1 rounded-[16px] px-1 text-20-medium text-heading hover:bg-stroke-200 dark:hover:bg-white/5"
        >
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem
          onClick={(e) => {
            e.stopPropagation();
            handleClick(last);
          }}
          className="cursor-pointer items-center gap-2 rounded-[16px] px-4 py-2 text-heading hover:bg-stroke-200 dark:hover:bg-white/5"
        >
          <FolderIconOutline />
          {last.name}
        </BreadcrumbItem>
      </>
    );
  };

  const renderExpanded = () => (
    <>
      {ancestors.map((ancestor, index) => (
        <React.Fragment key={ancestor.id}>
          <BreadcrumbItem
            onClick={(e) => {
              e.stopPropagation();
              handleClick(ancestor);
            }}
            className="cursor-pointer items-center gap-2 rounded-[16px] px-4 py-2 text-heading hover:bg-stroke-200 dark:hover:bg-white/5"
          >
            <FolderIconOutline />
            {ancestor.name}
          </BreadcrumbItem>
          {index !== ancestors.length - 1 && <BreadcrumbSeparator />}
        </React.Fragment>
      ))}
    </>
  );

  return (
    <Breadcrumb className="overflow-hidden px-2 py-1 text-sm text-heading">
      <BreadcrumbList
        ref={listRef}
        className="flex-nowrap overflow-x-auto overflow-y-hidden whitespace-nowrap"
      >
        {expanded || ancestors.length <= 2
          ? renderExpanded()
          : renderCollapsed()}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export const FileLocationBreadcrumb = ({
  folder,
  className,
}: {
  folder: FileMinViewDto;
  className?: string;
}) => {
  const ancestors = folder?.ancestors ?? [];
  const { isMobile } = useSidebar();

  if (!folder || ancestors.length === 0) return null;

  const nearestAncestor = ancestors[ancestors.length - 1];
  const TriggerContent = (
    <div
      className={`flex w-full max-w-[130px] cursor-pointer items-center gap-2 overflow-hidden ${className}`}
    >
      <span className="flex-shrink-0">
        <FolderIconOutline />
      </span>
      <span className="truncate whitespace-nowrap text-secondary-foreground">
        {nearestAncestor.name}
      </span>
    </div>
  );

  const Content = <MiniBreadcrumb folder={folder} />;

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>{TriggerContent}</PopoverTrigger>
        <PopoverContent
          side="left"
          sideOffset={-150}
          className="w-fit max-w-[80svw] rounded-[32px] p-2"
        >
          {Content}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{TriggerContent}</HoverCardTrigger>
      <HoverCardContent
        side="left"
        sideOffset={-200}
        className="w-fit max-w-[80svw] rounded-[32px] p-2"
      >
        {Content}
      </HoverCardContent>
    </HoverCard>
  );
};
