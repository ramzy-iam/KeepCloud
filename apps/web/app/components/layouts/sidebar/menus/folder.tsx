import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@keepcloud/web-core/react';
import { FolderIcon } from '../../../ui';
import { ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';

export const FolderMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <SidebarMenu>
      <Collapsible open={open} className="group/collapsible">
        <SidebarMenuItem>
          <SidebarMenuButton className="flex cursor-pointer items-center gap-3">
            <CollapsibleTrigger onClick={() => setOpen(!open)} asChild>
              <ChevronRightIcon
                width={16}
                height={16}
                className={open ? 'rotate-90' : ''}
              />
            </CollapsibleTrigger>
            ALL FOLDERS
          </SidebarMenuButton>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem className="flex items-center gap-2">
                <FolderIcon />
                Mockup
              </SidebarMenuSubItem>

              <SidebarMenuSubItem className="flex items-center gap-2">
                <FolderIcon />
                Photo
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  );
};
