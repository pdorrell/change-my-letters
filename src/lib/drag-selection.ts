import React, { useState, useCallback } from 'react';
import { RangeSelectable } from '@/lib/models/range-selectable';

// Utility function to find child element under touch coordinates
export function findChildUnderTouch(parentRef: React.RefObject<HTMLElement>, touchX: number, touchY: number): Element | null {
  if (!parentRef.current) return null;

  const selectableChildren = Array.from(
    parentRef.current.querySelectorAll('[data-selection-index]')
  );

  // Find the child that contains the touch point
  for (const child of selectableChildren) {
    const rect = child.getBoundingClientRect();

    if (touchX >= rect.left &&
        touchX <= rect.right &&
        touchY >= rect.top &&
        touchY <= rect.bottom) {
      return child;
    }
  }

  return null; // No child contains the touch point
}

export interface DragSelectionResult {
  isDragging: boolean;
  onPointerDown: (position: number) => void;
  onPointerEnter: (position: number) => void;
  onPointerUp: () => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

// Generic drag selection hook
export function useDragSelection(
  selectable: RangeSelectable,
  containerRef: React.RefObject<HTMLElement>
): DragSelectionResult {
  const [isDragging, setIsDragging] = useState(false);

  const startDrag = useCallback((position: number) => {
    setIsDragging(true);
    selectable.startSelection(position);
  }, [selectable]);

  const updateDrag = useCallback((position: number) => {
    if (isDragging) {
      selectable.updateSelection(position);
    }
  }, [isDragging, selectable]);

  const finishDrag = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      selectable.finishSelection();
    }
  }, [isDragging, selectable]);

  // Pointer event handlers
  const handlePointerDown = useCallback((position: number) => {
    if (selectable.canSelect) {
      startDrag(position);
    }
  }, [startDrag, selectable]);

  const handlePointerEnter = useCallback((position: number) => {
    if (selectable.canSelect) {
      updateDrag(position);
    }
  }, [updateDrag, selectable]);

  const handlePointerUp = useCallback(() => {
    if (selectable.canSelect) {
      finishDrag();
    }
  }, [finishDrag, selectable]);

  // Touch move handler for iOS Safari where onPointerEnter doesn't work
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !selectable.canSelect) return;

    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    if (!touch) return;

    const childUnderTouch = findChildUnderTouch(containerRef, touch.clientX, touch.clientY);

    if (childUnderTouch) {
      const selectionIndex = parseInt(
        childUnderTouch.getAttribute('data-selection-index') || '0',
        10
      );

      updateDrag(selectionIndex);
    }
  }, [isDragging, selectable, containerRef, updateDrag]);

  // Touch end handler for iOS Safari where onPointerUp doesn't work
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (selectable.canSelect) {
      e.preventDefault();
      finishDrag();
    }
  }, [finishDrag, selectable]);

  // Global event handlers
  React.useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        selectable.finishSelection();
      }
    };

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (containerRef.current && !containerRef.current.contains(target)) {
        selectable.clearSelection();
      }
    };

    document.addEventListener('pointerup', handleGlobalPointerUp);
    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('pointerup', handleGlobalPointerUp);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [isDragging, selectable, containerRef]);

  return {
    isDragging,
    onPointerDown: handlePointerDown,
    onPointerEnter: handlePointerEnter,
    onPointerUp: handlePointerUp,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
