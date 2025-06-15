import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { RangeSelectable } from '@/libs/models/range-selectable';
import { LettersRow } from '@/models/finders/words-in-row-finder/letters-row';

// Generic drag selection interfaces and types
function findChildUnderTouch(parentRef: React.RefObject<HTMLElement>, touchX: number, touchY: number): Element | null {
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

interface DragSelectionResult {
  isDragging: boolean;
  onPointerDown: (position: number) => void;
  onPointerEnter: (position: number) => void;
  onPointerUp: () => void;
  onTouchMove: (e: React.TouchEvent) => void;
}

// Generic drag selection hook
function useDragSelection(
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
  };
}

// Reusable draggable table cell component
interface DragSelectableTdProps {
  index: number;
  className: string;
  dragSelection: DragSelectionResult;
  children: React.ReactNode;
}

const DragSelectableTd: React.FC<DragSelectableTdProps> = observer(({
  index,
  className,
  dragSelection,
  children
}) => (
  <td
    className={className}
    data-selection-index={index}
    onPointerDown={() => dragSelection.onPointerDown(index)}
    onPointerEnter={() => dragSelection.onPointerEnter(index)}
    onPointerUp={dragSelection.onPointerUp}
  >
    {children}
  </td>
));

interface LettersRowViewProps {
  selectable: RangeSelectable;
  lettersRow: LettersRow;
}

export const LettersRowView: React.FC<LettersRowViewProps> = observer(({
  selectable,
  lettersRow
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Use the generic drag selection hook
  const dragSelection = useDragSelection(
    selectable,
    containerRef
  );

  const getWordFirstPosition = (): number | null => {
    // For completed selections, we need to determine which end was the starting position
    // We can use the stored drag direction information from the LettersRow
    if (lettersRow.correctSelection) {
      return lettersRow.correctSelectionStart ?? null;
    }
    if (lettersRow.wrongSelection) {
      return lettersRow.wrongSelectionStart ?? null;
    }
    return null;
  };

  const getCellClassName = (index: number): string => {
    const baseClass = 'letters-row-cell';
    const selection = lettersRow.selection;
    const classes = [baseClass];

    if (lettersRow.interactionsDisabled) {
      classes.push('letters-row-cell--disabled');
    }

    if (selection && index >= selection.start && index <= selection.end) {
      if (lettersRow.selectionState) {
        classes.push('letters-row-cell--dragging');
      } else if (lettersRow.correctSelection) {
        classes.push('letters-row-cell--correct');
      } else if (lettersRow.wrongSelection) {
        classes.push('letters-row-cell--wrong');
      }

      // Add border classes for start and end of selection
      if (index === selection.start) {
        classes.push('letters-row-cell--drag-start');
      }
      if (index === selection.end) {
        classes.push('letters-row-cell--drag-end');
      }

      // Add class for the first letter of the word (where user started dragging)
      if (lettersRow.selectionState && index === lettersRow.selectionState.start) {
        classes.push('letters-row-cell--first-letter');
      } else if ((lettersRow.correctSelection || lettersRow.wrongSelection) && lettersRow.selectionState === null) {
        // For completed selections, we need to determine the first letter based on the stored drag direction
        // We'll need to access this information from the LettersRow model
        const wordStart = getWordFirstPosition();
        if (wordStart !== null && index === wordStart) {
          classes.push('letters-row-cell--first-letter');
        }
      }
    }

    return classes.join(' ');
  };


  return (
    <div className="letters-row-view" ref={containerRef}>
      <div className="letters-row-wrapper">
        <table
          className="letters-row-table"
          onTouchMove={dragSelection.onTouchMove}
        >
        <tbody>
          <tr>
            {lettersRow.lettersArray.map((letter, index) => (
              <DragSelectableTd
                key={index}
                index={index}
                className={getCellClassName(index)}
                dragSelection={dragSelection}
              >
                {letter}
              </DragSelectableTd>
            ))}
          </tr>
        </tbody>
        </table>
      </div>
    </div>
  );
});
