import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { LettersRow } from '@/models/finders/words-in-row-finder/letters-row';

// Generic drag selection interfaces and types
interface DragSelectionCallbacks {
  onStartDrag: (position: number) => void;
  onUpdateDrag: (position: number) => void;
  onFinishDrag: () => void;
  onClearSelection: () => void;
}

interface DragSelectionOptions {
  isDisabled: () => boolean;
  cellSelector: string;
  containerSelector: string;
}

interface DragSelectionResult {
  isDragging: boolean;
  onMouseDown: (position: number) => void;
  onMouseEnter: (position: number) => void;
  onMouseUp: () => void;
  onTouchStart: (e: React.TouchEvent, position: number) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

// Generic drag selection hook
function useDragSelection(
  callbacks: DragSelectionCallbacks,
  options: DragSelectionOptions
): DragSelectionResult {
  const [isDragging, setIsDragging] = useState(false);

  const startDrag = useCallback((position: number) => {
    setIsDragging(true);
    callbacks.onStartDrag(position);
  }, [callbacks.onStartDrag]);

  const updateDrag = useCallback((position: number) => {
    if (isDragging) {
      callbacks.onUpdateDrag(position);
    }
  }, [isDragging, callbacks.onUpdateDrag]);

  const finishDrag = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      callbacks.onFinishDrag();
    }
  }, [isDragging, callbacks.onFinishDrag]);

  // Mouse event handlers
  const handleMouseDown = useCallback((position: number) => {
    if (!options.isDisabled()) {
      startDrag(position);
    }
  }, [startDrag, options.isDisabled]);

  const handleMouseEnter = useCallback((position: number) => {
    if (!options.isDisabled()) {
      updateDrag(position);
    }
  }, [updateDrag, options.isDisabled]);

  const handleMouseUp = useCallback(() => {
    if (!options.isDisabled()) {
      finishDrag();
    }
  }, [finishDrag, options.isDisabled]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent, position: number) => {
    if (!options.isDisabled()) {
      e.preventDefault(); // Prevent scrolling
      startDrag(position);
    }
  }, [startDrag, options.isDisabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || options.isDisabled()) return;

    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    if (!touch) return;

    // Find the element under the touch point
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elementBelow) return;

    // Find the closest cell with the specified selector
    const cell = elementBelow.closest(options.cellSelector);
    if (!cell) return;

    // Get the index from the cell's position in the row
    const row = cell.parentElement;
    if (!row) return;

    const cells = Array.from(row.children);
    const cellIndex = cells.indexOf(cell as Element);
    if (cellIndex >= 0) {
      updateDrag(cellIndex);
    }
  }, [isDragging, updateDrag, options.cellSelector, options.isDisabled]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!options.isDisabled()) {
      e.preventDefault();
      finishDrag();
    }
  }, [finishDrag, options.isDisabled]);

  // Global event handlers
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        callbacks.onFinishDrag();
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        callbacks.onFinishDrag();
      }
    };

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest(options.containerSelector)) {
        callbacks.onClearSelection();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalTouchEnd);
    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [isDragging, callbacks.onFinishDrag, callbacks.onClearSelection, options.containerSelector]);

  return {
    isDragging,
    onMouseDown: handleMouseDown,
    onMouseEnter: handleMouseEnter,
    onMouseUp: handleMouseUp,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
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
    onMouseDown={() => dragSelection.onMouseDown(index)}
    onMouseEnter={() => dragSelection.onMouseEnter(index)}
    onMouseUp={dragSelection.onMouseUp}
    onTouchStart={(e) => dragSelection.onTouchStart(e, index)}
    onTouchEnd={dragSelection.onTouchEnd}
  >
    {children}
  </td>
));

interface LettersRowViewProps {
  lettersRow: LettersRow;
  onStartDrag: (position: number) => void;
  onUpdateDrag: (position: number) => void;
  onFinishDrag: () => void;
  onClearSelection: () => void;
}

export const LettersRowView: React.FC<LettersRowViewProps> = observer(({
  lettersRow,
  onStartDrag,
  onUpdateDrag,
  onFinishDrag,
  onClearSelection
}) => {
  // Use the generic drag selection hook
  const dragSelection = useDragSelection(
    {
      onStartDrag,
      onUpdateDrag,
      onFinishDrag,
      onClearSelection,
    },
    {
      isDisabled: () => lettersRow.interactionsDisabled,
      cellSelector: 'td.letters-row-cell',
      containerSelector: '.letters-row-view',
    }
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
    <div className="letters-row-view">
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
