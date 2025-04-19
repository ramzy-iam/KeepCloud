import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarMenuButton,
} from '@keepcloud/web-core/react';
import { FolderIcon } from '../../../ui';
import { ChevronRightIcon, FileTextIcon } from 'lucide-react';
import { useState } from 'react';

const File = ({
  name,
  icon = <FileTextIcon />,
  noIcon = false,
}: {
  name: string;
  icon?: React.ReactNode;
  noIcon?: boolean;
}) => {
  return (
    <div className="pl-6">
      <SidebarMenuButton className="flex cursor-pointer items-center gap-3">
        {!noIcon && icon}
        {name}
      </SidebarMenuButton>
    </div>
  );
};

const Folder = ({
  name,
  icon = <FolderIcon />,
  noIcon = false,
  children,
  root = false,
}: {
  name: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  noIcon?: boolean;
  root?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="h-full">
      <SidebarMenuButton className="flex w-[217px] cursor-pointer items-center gap-3">
        <CollapsibleTrigger asChild>
          <div onClick={() => setOpen(!open)}>
            <ChevronRightIcon
              width={16}
              height={16}
              className={`transition-transform ${open ? 'rotate-90' : ''}`}
            />
          </div>
        </CollapsibleTrigger>
        <div className="flex items-center gap-3">
          {!noIcon && icon}
          {name}
        </div>
      </SidebarMenuButton>
      <CollapsibleContent className="-pl-3 relative before:absolute before:top-0 before:bottom-0 before:left-2 before:w-px before:bg-border">
        <div className="ml-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export const FileTree = () => {
  return (
    <Folder name="ALL FOLDERS" noIcon={true}>
      <Folder name="Folder A">
        <File name="File A1" />
      </Folder>
      <Folder name="Folder B" />
      <Folder name="Folder C">
        <File name="File C2" />
        <Folder name="Folder C">
          <Folder name="Folder C">
            <File name="File C2" />
            <Folder name="Folder C">
              <File name="File C2" />
              <Folder name="Folder C">
                <File name="File C2" />
                <Folder name="Folder C">
                  <Folder name="Folder C">
                    <File name="File C2" />
                    <Folder name="Folder C">
                      <File name="File C2" />
                    </Folder>
                  </Folder>
                </Folder>
              </Folder>
            </Folder>
          </Folder>
        </Folder>
      </Folder>
    </Folder>
  );
};
