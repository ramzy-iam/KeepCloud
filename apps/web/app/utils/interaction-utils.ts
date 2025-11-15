import { useEffect, useState, useRef } from 'react';

export interface InteractionHandlers {
  handleClick: (
    e: React.MouseEvent,
    itemId: string,
    onSelect?: (
      id: string,
      selected: boolean,
      addToSelection?: boolean,
    ) => void,
    onOpen?: () => void,
  ) => void;
  handleDoubleClick: (e: React.MouseEvent, onOpen?: () => void) => void;
}

export const useDeviceDetection = () => {
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

  return { isMobile };
};

export const useInteractionHandlers = (
  isMobile: boolean,
): InteractionHandlers => {
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const selectItem = (
    itemId: string,
    onSelect?: (
      id: string,
      selected: boolean,
      addToSelection?: boolean,
    ) => void,
    addToSelection = false,
  ) => {
    if (!onSelect) return;
    onSelect(itemId, true, addToSelection);
  };

  const handleClick = (
    e: React.MouseEvent,
    itemId: string,
    onSelect?: (
      id: string,
      selected: boolean,
      addToSelection?: boolean,
    ) => void,
    onOpen?: () => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isMobile) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }

      if (e.shiftKey && onSelect) {
        selectItem(itemId, onSelect, true);
      } else if (onSelect) {
        clickTimeoutRef.current = setTimeout(() => {
          selectItem(itemId, onSelect, false);
          clickTimeoutRef.current = null;
        }, 300);
      } else {
        onOpen?.();
      }
    } else {
      // For mobile, just open the item (selection handled by touch events)
      onOpen?.();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent, onOpen?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMobile) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      onOpen?.();
    }
  };

  return {
    handleClick,
    handleDoubleClick,
  };
};

// Legacy function for backward compatibility - now just calls the hook
export const createInteractionHandlers = (
  isMobile: boolean,
): InteractionHandlers => {
  // This is not ideal since we can't use hooks here, but we'll deprecate this approach
  // For now, we'll return a simple implementation without the timeout management
  const handleClick = (
    e: React.MouseEvent,
    itemId: string,
    onSelect?: (
      id: string,
      selected: boolean,
      addToSelection?: boolean,
    ) => void,
    onOpen?: () => void,
  ) => {
    e.stopPropagation();

    if (!isMobile) {
      if (e.shiftKey && onSelect) {
        onSelect(itemId, true, true);
      } else if (onSelect) {
        onSelect(itemId, true, false);
      } else {
        onOpen?.();
      }
    } else {
      onOpen?.();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent, onOpen?: () => void) => {
    e.stopPropagation();
    if (!isMobile) {
      onOpen?.();
    }
  };

  return {
    handleClick,
    handleDoubleClick,
  };
};
