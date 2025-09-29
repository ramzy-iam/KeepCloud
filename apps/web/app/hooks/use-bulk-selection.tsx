import { useState, useCallback, useMemo } from 'react';
import { FileMinViewDto } from '@keepcloud/commons/dtos';

export interface BulkSelectionState {
  selectedItems: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  selectedCount: number;
}

export interface BulkSelectionActions {
  toggleItem: (id: string) => void;
  toggleAll: (items: FileMinViewDto[]) => void;
  clearSelection: () => void;
  isItemSelected: (id: string) => boolean;
  getSelectedItems: (items: FileMinViewDto[]) => FileMinViewDto[];
}

export interface UseBulkSelectionReturn
  extends BulkSelectionState,
    BulkSelectionActions {}

export function useBulkSelection(): UseBulkSelectionReturn {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleItem = useCallback((id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleAll = useCallback(
    (items: FileMinViewDto[]) => {
      const itemIds = items.map((item) => item.id);
      const allSelected = itemIds.every((id) => selectedItems.has(id));

      if (allSelected) {
        // Deselect all
        setSelectedItems((prev) => {
          const newSet = new Set(prev);
          itemIds.forEach((id) => newSet.delete(id));
          return newSet;
        });
      } else {
        // Select all
        setSelectedItems((prev) => {
          const newSet = new Set(prev);
          itemIds.forEach((id) => newSet.add(id));
          return newSet;
        });
      }
    },
    [selectedItems],
  );

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const isItemSelected = useCallback(
    (id: string) => {
      return selectedItems.has(id);
    },
    [selectedItems],
  );

  const getSelectedItems = useCallback(
    (items: FileMinViewDto[]) => {
      return items.filter((item) => selectedItems.has(item.id));
    },
    [selectedItems],
  );

  const state = useMemo(() => {
    const selectedCount = selectedItems.size;

    return {
      selectedItems,
      selectedCount,
      isAllSelected: selectedCount > 0,
      isIndeterminate: selectedCount > 0,
    };
  }, [selectedItems]);

  return {
    ...state,
    toggleItem,
    toggleAll,
    clearSelection,
    isItemSelected,
    getSelectedItems,
  };
}
