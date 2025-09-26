import { useState, useRef, useCallback, useEffect } from 'react';

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
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileUserAgent =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      setIsMobile(isMobileUserAgent);
    };
    checkMobile();
  }, []);

  const selectItem = useCallback(
    (addToSelection = false) => {
      if (!onSelect) return;
      onSelect(itemId, true, addToSelection);
    },
    [onSelect, itemId],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!clickable) return;

      if (!isMobile) {
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
        }

        if (e.shiftKey && onSelect) {
          selectItem(true);
        } else if (onSelect) {
          clickTimeoutRef.current = setTimeout(() => {
            selectItem(false);
            clickTimeoutRef.current = null;
          }, 200);
        } else {
          onOpen?.();
        }
      } else {
        if (!isLongPressed) {
          onOpen?.();
        }
        setIsLongPressed(false);
      }
    },
    [isMobile, isLongPressed, clickable, selectItem, onSelect, onOpen],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isMobile && clickable) {
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
        }
        onOpen?.();
      }
    },
    [isMobile, clickable, onOpen],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile || !onSelect) return;
      e.stopPropagation();
      setIsLongPressed(false);

      longPressRef.current = setTimeout(() => {
        setIsLongPressed(true);
        selectItem(false);
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, 500);
    },
    [isMobile, onSelect, selectItem],
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
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
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
