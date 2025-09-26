import { useCallback } from 'react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { BulkAction } from '../components';

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
  const handleBulkAction = useCallback(
    async (action: BulkAction, items: FileMinViewDto[]) => {
      console.log(`Executing bulk action: ${action} on ${items.length} items`);

      try {
        switch (action) {
          case 'download':
            await handlers.onDownload?.(items);
            break;
          case 'trash':
            await handlers.onTrash?.(items);
            break;
          case 'delete':
            await handlers.onDelete?.(items);
            break;
          case 'restore':
            await handlers.onRestore?.(items);
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
    [handlers, onActionComplete],
  );

  return { handleBulkAction };
}

export const BULK_ACTION_CONFIGS = {
  FILES: ['download', 'trash'] as BulkAction[],

  TRASH: ['restore', 'delete'] as BulkAction[],
};
