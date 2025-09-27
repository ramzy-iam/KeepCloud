import { useMemo } from 'react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';
import { ColumnDef } from '@tanstack/react-table';
import { useBulkSelection } from './use-bulk-selection';
import { createMobileSelectColumn } from '../routes/app/home/columns';
import { useDeviceDetection } from '../utils/interaction-utils';
import { BulkAction } from '../components';

export interface BulkSelectionConfig {
  enableSelection?: boolean;
  availableBulkActions?: BulkAction[];
  onBulkAction?: (action: BulkAction, items: FileMinViewDto[]) => void;
}

export interface UseBulkSelectionProviderOptions {
  items: FileMinViewDto[];
  baseColumns: ColumnDef<FileMinViewDto>[];
  config?: BulkSelectionConfig;
}

export interface BulkSelectionProviderReturn {
  // Selection state
  selection: ReturnType<typeof useBulkSelection>;

  // Computed columns (with mobile checkboxes if needed)
  columns: ColumnDef<FileMinViewDto>[];

  folderViewProps: {
    enableSelection: boolean;
    externalSelection?: ReturnType<typeof useBulkSelection>;
    onBulkAction?: (action: BulkAction, items: FileMinViewDto[]) => void;
    availableBulkActions?: BulkAction[];
  };

  handleBulkAction: (action: BulkAction, items: FileMinViewDto[]) => void;
}

export function useBulkSelectionProvider({
  items,
  baseColumns,
  config = {},
}: UseBulkSelectionProviderOptions): BulkSelectionProviderReturn {
  const { isMobile } = useDeviceDetection();
  const selection = useBulkSelection();

  const {
    enableSelection = true,
    availableBulkActions = [],
    onBulkAction,
  } = config;

  const columns = useMemo(() => {
    if (!isMobile || !enableSelection) {
      return baseColumns;
    }

    const selectionState = selection.getState(items);

    return [
      createMobileSelectColumn<FileMinViewDto>({
        getRowId: (file) => file.id,
        externalSelection: {
          selectedItems: selection.selectedItems,
          onSelectionChange: (id, selected, addToSelection) => {
            if (addToSelection) {
              selection.toggleItem(id);
            } else {
              selection.clearSelection();
              if (selected) {
                selection.toggleItem(id);
              }
            }
          },
          isAllSelected: selectionState.isAllSelected,
          isIndeterminate: selectionState.isIndeterminate,
          onSelectAll: () => selection.toggleAll(items),
        },
      }),
      ...baseColumns,
    ];
  }, [isMobile, enableSelection, baseColumns, selection, items]);

  const handleBulkAction = async (
    action: BulkAction,
    items: FileMinViewDto[],
  ) => {
    if (onBulkAction) {
      try {
        await onBulkAction(action, items);

        selection.clearSelection();
      } catch (error) {
        console.error(`Bulk action ${action} failed:`, error);
      }
    } else {
      console.log(`Bulk action: ${action} on ${items.length} items:`, items);
    }
  };

  const folderViewProps = {
    enableSelection,
    externalSelection: enableSelection ? selection : undefined,
    onBulkAction: enableSelection ? handleBulkAction : undefined,
    availableBulkActions: enableSelection ? availableBulkActions : undefined,
  };

  return {
    selection,
    columns,
    folderViewProps,
    handleBulkAction,
  };
}
