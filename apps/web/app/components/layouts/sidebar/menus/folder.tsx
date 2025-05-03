import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ROUTE_PATH,
  SidebarMenuButton,
} from '@keepcloud/web-core/react';
import { FolderIcon } from '../../../ui';
import { ChevronRightIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { File } from '@keepcloud/commons/types';
import { useLocation, useNavigate } from 'react-router';

interface FileNodeProps {
  file: File;
  icon?: React.ReactNode;
  noIcon?: boolean;
  children?: React.ReactNode;
}

const FileNode = ({
  file,
  icon = <FolderIcon />,
  noIcon = false,
  children,
}: FileNodeProps) => {
  const { name, id } = file;
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const url = ROUTE_PATH.folderDetails(id);
  const { pathname } = useLocation();

  useEffect(() => {
    setIsActive(pathname === url);
  }, [pathname, url]);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="relative h-full w-[200px]"
    >
      <SidebarMenuButton
        isActive={isActive}
        className="flex w-full gap-0 hover:bg-sidebar-accent/30 dark:hover:bg-sidebar-accent/50"
        onClick={() => {
          navigate(url);
        }}
      >
        <CollapsibleTrigger asChild>
          <span
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
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
        <div className="ml-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const FileTreeNode = ({ file }: { file: File }) => {
  if (file.fileType !== 'folder') {
    return null;
  }

  const sortedChildren = file.children
    ? [...file.children]
        .filter((child) => child.fileType === 'folder')
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <FileNode file={file} icon={<FolderIcon />} noIcon={false}>
      {sortedChildren.map((child) => (
        <FileTreeNode key={child.id} file={child} />
      ))}
    </FileNode>
  );
};

interface FileTreeProps {
  files: File[];
}

export const FileTree = ({ files }: FileTreeProps) => {
  const rootFolders = [...files]
    .filter((file) => file.fileType === 'folder')
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      {rootFolders.map((file) => (
        <FileNode key={file.id} file={file} noIcon={true}>
          {file.children
            ?.filter((child) => child.fileType === 'folder')
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((child) => <FileTreeNode key={child.id} file={child} />)}
        </FileNode>
      ))}
    </div>
  );
};
