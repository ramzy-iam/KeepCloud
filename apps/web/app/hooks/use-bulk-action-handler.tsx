import { useCallback } from 'react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { BulkAction } from '@keepcloud/commons/types';
import {
  useBulkMoveToTrash,
  useBulkRestore,
  useDialog,
} from '@keepcloud/web-core/react';

export interface BulkActionHandlers {
  onDownload?: (items: FileMinViewDto[]) => void | Promise<void>;
  onTrash?: (items: FileMinViewDto[]) => void | Promise<void>;
  onDelete?: (items: FileMinViewDto[]) => void | Promise<void>;
  onRestore?: (items: FileMinViewDto[]) => void | Promise<void>;
}

export interface UseBulkActionHandlerOptions {
  handlers?: BulkActionHandlers;
  onActionComplete?: (action: BulkAction, items: FileMinViewDto[]) => void;
}

export function useBulkActionHandler({
  handlers = {},
  onActionComplete,
}: UseBulkActionHandlerOptions = {}) {
  const bulkMoveToTrash = useBulkMoveToTrash();
  const bulkRestore = useBulkRestore();
  const { openDialog } = useDialog();

  const handleBulkAction = useCallback(
    async (action: BulkAction, items: FileMinViewDto[]) => {
      const fileIds = items.map((item) => item.id);

      try {
        switch (action) {
          case 'download':
            if (handlers.onDownload) {
              await handlers.onDownload(items);
              return;
            } else {
              console.log('Downloading folder items:', items);
            }
            break;
          case 'trash':
            if (handlers.onTrash) {
              await handlers.onTrash(items);
            } else {
              await bulkMoveToTrash.mutateAsync(fileIds);
            }
            break;
          case 'delete':
            if (handlers.onDelete) {
              await handlers.onDelete(items);
            } else {
              // Show confirmation dialog for bulk delete
              openDialog({
                type: 'bulkDeleteConfirmation',
                context: { items, onActionComplete },
              });
              return; // Don't call onActionComplete here, it will be called after confirmation
            }
            break;
          case 'restore':
            if (handlers.onRestore) {
              await handlers.onRestore(items);
            } else {
              await bulkRestore.mutateAsync(fileIds);
            }
            break;
          default:
            console.warn(`Unhandled bulk action: ${action}`);
        }

        // Notify completion
        onActionComplete?.(action, items);
      } catch (error) {
        console.error(`Error executing bulk action ${action}:`, error);
        // You could add toast notifications here
      }
    },
    [handlers, onActionComplete, bulkMoveToTrash, bulkRestore, openDialog],
  );

  return { handleBulkAction };
}

export const BULK_ACTION_CONFIGS = {
  FILES: ['trash'] as BulkAction[],
  TRASH: ['restore', 'delete'] as BulkAction[],
};
