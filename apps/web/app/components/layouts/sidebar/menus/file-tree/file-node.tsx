import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DEFAULT_ACTIVE_FOLDER,
  SidebarMenuButton,
  useGetActiveFolder,
} from '@keepcloud/web-core/react';
import { FolderIcon } from '../../../../ui';
import { ChevronRightIcon, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { FileMinViewDto } from '@keepcloud/commons/dtos';

interface FileNodeProps {
  file: FileMinViewDto;
  icon?: React.ReactNode;
  noIcon?: boolean;
  children?: React.ReactNode;
  fetchChildren?: () => Promise<FileMinViewDto[]>;
  isRoot?: boolean;
  url: string;
}

export const FileNode = ({
  file,
  icon = <FolderIcon />,
  noIcon = false,
  children,
  fetchChildren,
  isRoot = false,
  url,
}: FileNodeProps) => {
  const { name, id } = file;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { setActiveFolder } = useGetActiveFolder();
  const [open, setOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [loadedChildren, setLoadedChildren] = useState<FileMinViewDto[]>(
    file.children || [],
  );
  const [isChildrenLoading, setIsChildrenLoading] = useState(false);

  useEffect(() => {
    setIsActive(pathname === url);
  }, [pathname, url]);

  const handleFetchChildren = async () => {
    if (fetchChildren && !loadedChildren.length) {
      setIsChildrenLoading(true);
      try {
        const children = await fetchChildren();
        setLoadedChildren(children);
      } finally {
        setIsChildrenLoading(false);
      }
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
    if (!open && fetchChildren) {
      await handleFetchChildren();
    }
  };

  const handleNavigate = () => {
    if (isRoot) {
      setActiveFolder(DEFAULT_ACTIVE_FOLDER);
      navigate('/folders');
    } else if (id) {
      setActiveFolder({ id, name, system: false });
      navigate(url);
    }
  };

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
          {!noIcon && <span>{icon}</span>}
          <span className="truncate" title={name}>
            {name}
          </span>
        </div>
      </SidebarMenuButton>

      <CollapsibleContent className="-pl-3 relative before:absolute before:top-0 before:bottom-0 before:left-2 before:w-px before:bg-border">
        <div className="ml-2">
          {isChildrenLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="animate-spin" size={16} />
            </div>
          ) : (
            children
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
