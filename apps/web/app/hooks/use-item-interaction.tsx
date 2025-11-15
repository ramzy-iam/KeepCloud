import { useState, useRef, useCallback, useEffect } from 'react';
import {
  useDeviceDetection,
  useInteractionHandlers,
} from '../utils/interaction-utils';

interface UseItemInteractionOptions {
  onSelect?: (id: string, selected: boolean, addToSelection?: boolean) => void;
  onOpen?: () => void;
  isSelected?: boolean;
  itemId: string;
  clickable?: boolean;
}

interface UseItemInteractionReturn {
  isMobile: boolean;
  isLongPressed: boolean;
  handleClick: (e: React.MouseEvent) => void;
  handleDoubleClick: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  handleTouchCancel: (e: React.TouchEvent) => void;
  handleContextMenu: (e: React.MouseEvent) => void;
}

export function useItemInteraction({
  onSelect,
  onOpen,
  isSelected = false,
  itemId,
  clickable = true,
}: UseItemInteractionOptions): UseItemInteractionReturn {
  const longPressRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressed, setIsLongPressed] = useState(false);
  const { isMobile } = useDeviceDetection();
  const interactionHandlers = useInteractionHandlers(isMobile);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!clickable) return;

      if (!isMobile) {
        // Use shared interaction handlers for desktop
        interactionHandlers.handleClick(e, itemId, onSelect, onOpen);
      } else {
        // On mobile, simple tap should clear all selections and then open the file
        if (onSelect) {
          // Clear all selections by calling onSelect with the current item and selected=false, addToSelection=false
          // The FolderView's handleSelectionChange will clear all selections when addToSelection is false
          onSelect(itemId, false, false);
        }
        onOpen?.();
        setIsLongPressed(false);
      }
    },
    [isMobile, clickable, itemId, onSelect, onOpen, interactionHandlers],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isMobile && clickable) {
        // Clear all selections first, then open
        if (onSelect) {
          onSelect(itemId, false, false);
        }
        // Use shared interaction handlers for desktop
        interactionHandlers.handleDoubleClick(e, onOpen);
      }
    },
    [isMobile, clickable, onOpen, interactionHandlers, onSelect, itemId],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile || !onSelect) return;
      e.stopPropagation();
      setIsLongPressed(false);

      longPressRef.current = setTimeout(() => {
        setIsLongPressed(true);
        // Long press: select item and add to existing selection for multi-select
        if (isSelected) {
          // Deselect if already selected - keep other selections
          onSelect(itemId, false, true);
        } else {
          // Select the item and add to existing selection
          onSelect(itemId, true, true);
        }
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, 500);
    },
    [isMobile, onSelect, isSelected, itemId],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return;
      e.stopPropagation();
      if (longPressRef.current) {
        clearTimeout(longPressRef.current);
        longPressRef.current = null;
      }
    },
    [isMobile],
  );

  const handleTouchCancel = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return;
      e.stopPropagation();
      if (longPressRef.current) {
        clearTimeout(longPressRef.current);
        longPressRef.current = null;
      }
      setIsLongPressed(false);
    },
    [isMobile],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) {
        e.preventDefault();
      }
    },
    [isMobile],
  );

  useEffect(() => {
    return () => {
      if (longPressRef.current) {
        clearTimeout(longPressRef.current);
      }
    };
  }, []);

  return {
    isMobile,
    isLongPressed,
    handleClick,
    handleDoubleClick,
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
    handleContextMenu,
  };
}
