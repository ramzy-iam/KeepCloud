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
  getState: (items?: FileMinViewDto[]) => BulkSelectionState;
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

  const getState = useCallback(
    (items?: FileMinViewDto[]) => {
      const selectedCount = selectedItems.size;
      const totalItems = items?.length || 0;

      return {
        selectedItems,
        selectedCount,
        isAllSelected: selectedCount > 0 && selectedCount === totalItems,
        isIndeterminate: selectedCount > 0 && selectedCount < totalItems,
      };
    },
    [selectedItems],
  );

  // Default state (without items context)
  const defaultState = useMemo(() => {
    const selectedCount = selectedItems.size;

    return {
      selectedItems,
      selectedCount,
      isAllSelected: selectedCount > 0, // Default to true if any selected
      isIndeterminate: false, // Can't determine without items
    };
  }, [selectedItems]);

  return {
    ...defaultState,
    toggleItem,
    toggleAll,
    clearSelection,
    isItemSelected,
    getSelectedItems,
    getState, // New method to get state with items context
  };
}
