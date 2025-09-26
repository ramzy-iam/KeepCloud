import React from 'react';
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@keepcloud/web-core/react';
import {
  Download,
  Trash2,
  Share2,
  MoreVertical,
  X,
  FolderOpen,
} from 'lucide-react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';

export type BulkAction = 'download' | 'share' | 'trash' | 'delete' | 'restore';

export interface BulkOperationMenuProps {
  selectedItems: FileMinViewDto[];
  selectedCount: number;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  onBulkAction?: (action: BulkAction, items: FileMinViewDto[]) => void;
  availableActions?: BulkAction[];
  className?: string;
}

const DEFAULT_ACTIONS: BulkAction[] = ['download', 'share', 'trash'];

const ACTION_ICONS: Record<BulkAction, React.ReactNode> = {
  download: <Download className="h-4 w-4" />,
  share: <Share2 className="h-4 w-4" />,
  trash: <Trash2 className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  restore: <FolderOpen className="h-4 w-4" />,
};

const ACTION_LABELS: Record<BulkAction, string> = {
  download: 'Download',
  share: 'Share',
  trash: 'Move to trash',
  delete: 'Delete forever',
  restore: 'Restore',
};

export const BulkOperationMenu: React.FC<BulkOperationMenuProps> = ({
  selectedItems,
  selectedCount,
  onSelectAll,
  onClearSelection,
  isAllSelected = false,
  isIndeterminate = false,
  onBulkAction,
  availableActions = DEFAULT_ACTIONS,
  className,
}) => {
  if (selectedCount === 0) return null;

  const handleAction = (action: BulkAction) => {
    onBulkAction?.(action, selectedItems);
  };

  const renderActionButton = (action: BulkAction, showLabel = true) => (
    <Button
      key={action}
      variant="ghost"
      size="sm"
      onClick={() => handleAction(action)}
      className="flex items-center gap-2 dark:hover:bg-background"
    >
      {ACTION_ICONS[action]}
      {showLabel && (
        <span className="hidden sm:inline">{ACTION_LABELS[action]}</span>
      )}
    </Button>
  );

  // Primary actions (always visible)
  const primaryActions = availableActions.slice(0, 4);
  // Secondary actions (in dropdown)
  const secondaryActions = availableActions.slice(4);

  return (
    <div
      className={cn(
        'sticky top-0 z-10 rounded-full border border-border bg-border',
        'flex items-center justify-between gap-4 px-4 py-2',
        'transition-all duration-200 ease-in-out',
        className,
      )}
    >
      {/* Left side - Selection info and controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="size-[24px] rounded-full text-muted-foreground hover:text-foreground dark:hover:bg-background"
          >
            <X className="h-2 w-2" />
          </Button>
          <span className="text-sm font-medium">{selectedCount} selected</span>
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-2">
        {/* Primary actions */}
        <div className="flex items-center gap-1">
          {primaryActions.map((action) => renderActionButton(action, false))}
        </div>

        {/* Secondary actions dropdown */}
        {secondaryActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              {secondaryActions.map((action) => (
                <React.Fragment key={action}>
                  <DropdownMenuItem
                    onClick={() => handleAction(action)}
                    className="flex items-center gap-2"
                  >
                    {ACTION_ICONS[action]}
                    <span>{ACTION_LABELS[action]}</span>
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
