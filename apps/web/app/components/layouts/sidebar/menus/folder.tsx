import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarMenuButton,
} from '@keepcloud/web-core/react';
import { FolderIcon } from '../../../ui';
import { ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';
import { File } from '@keepcloud/commons/types';

const Folder = ({
  name,
  icon = <FolderIcon />,
  noIcon = false,
  children,
}: {
  name: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  noIcon?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="h-full w-[200px]"
    >
      <SidebarMenuButton className="flex w-full cursor-pointer items-center gap-3">
        <CollapsibleTrigger asChild>
          <button
            onClick={() => setOpen((prev) => !prev)}
            tabIndex={0}
            aria-expanded={open}
            aria-label={`Toggle ${name} folder`}
          >
            <ChevronRightIcon
              width={16}
              height={16}
              className={`transition-transform ${open ? 'rotate-90' : ''}`}
            />
          </button>
        </CollapsibleTrigger>
        <div className="flex items-center gap-3 truncate">
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
  if (!file.isFolder && file.fileType !== 'folder') {
    return null;
  }

  const sortedChildren = file.children
    ? [...file.children]
        .filter((child) => child.isFolder || child.fileType === 'folder')
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <Folder name={file.name} icon={<FolderIcon />} noIcon={false}>
      {sortedChildren.map((child) => (
        <FileTreeNode key={child.id} file={child} />
      ))}
    </Folder>
  );
};

interface FileTreeProps {
  files: File[];
}

export const FileTree = ({ files }: FileTreeProps) => {
  const rootFolders = [...files]
    .filter((file) => file.isFolder || file.fileType === 'folder')
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      {rootFolders.map((file) => (
        <Folder key={file.id} name={file.name} noIcon={true}>
          {file.children
            ?.filter((child) => child.isFolder || child.fileType === 'folder')
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((child) => <FileTreeNode key={child.id} file={child} />)}
        </Folder>
      ))}
    </div>
  );
};
