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
    <div className="w-[200px] pl-6">
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
          <button onClick={() => setOpen((prev) => !prev)} tabIndex={0}>
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

export const FileTree = () => {
  return (
    <Folder name="ALL FOLDERS" noIcon={true}>
      <Folder name="Folder A">
        <File name="File A1" />
      </Folder>
      <Folder name="Folder B" />
      <Folder name="Folder Very long " />
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
              </Folder>
            </Folder>
          </Folder>
        </Folder>
      </Folder>
    </Folder>
  );
};
