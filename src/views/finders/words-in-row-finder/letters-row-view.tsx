import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { LettersRow } from '@/models/finders/words-in-row-finder/letters-row';

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
  const [isDragging, setIsDragging] = useState(false);

  const startDrag = useCallback((position: number) => {
    setIsDragging(true);
    onStartDrag(position);
  }, [onStartDrag]);

  const updateDrag = useCallback((position: number) => {
    if (isDragging) {
      onUpdateDrag(position);
    }
  }, [isDragging, onUpdateDrag]);

  const finishDrag = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onFinishDrag();
    }
  }, [isDragging, onFinishDrag]);

  // Mouse event handlers
  const handleMouseDown = useCallback((position: number) => {
    if (!lettersRow.interactionsDisabled) {
      startDrag(position);
    }
  }, [startDrag, lettersRow.interactionsDisabled]);

  const handleMouseEnter = useCallback((position: number) => {
    if (!lettersRow.interactionsDisabled) {
      updateDrag(position);
    }
  }, [updateDrag, lettersRow.interactionsDisabled]);

  const handleMouseUp = useCallback(() => {
    if (!lettersRow.interactionsDisabled) {
      finishDrag();
    }
  }, [finishDrag, lettersRow.interactionsDisabled]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent, position: number) => {
    if (!lettersRow.interactionsDisabled) {
      e.preventDefault(); // Prevent scrolling
      startDrag(position);
    }
  }, [startDrag, lettersRow.interactionsDisabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || lettersRow.interactionsDisabled) return;

    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    if (!touch) return;

    // Find the element under the touch point
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elementBelow) return;

    // Find the closest td with letters-row-cell class
    const cell = elementBelow.closest('td.letters-row-cell');
    if (!cell) return;

    // Get the index from the cell's position in the row
    const row = cell.parentElement;
    if (!row) return;

    const cells = Array.from(row.children);
    const cellIndex = cells.indexOf(cell as Element);
    if (cellIndex >= 0) {
      updateDrag(cellIndex);
    }
  }, [isDragging, updateDrag]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!lettersRow.interactionsDisabled) {
      e.preventDefault();
      finishDrag();
    }
  }, [finishDrag, lettersRow.interactionsDisabled]);

  const getCellClassName = (index: number): string => {
    const baseClass = 'letters-row-cell';
    const selection = lettersRow.draggedSelection;
    const classes = [baseClass];

    if (lettersRow.interactionsDisabled) {
      classes.push('letters-row-cell--disabled');
    }

    if (selection && index >= selection.start && index <= selection.end) {
      if (lettersRow.dragState) {
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
    }

    return classes.join(' ');
  };

  const getFirstLetterStyle = (index: number): React.CSSProperties => {
    const selection = lettersRow.draggedSelection;

    if (selection && index === selection.start && lettersRow.dragState) {
      return { fontWeight: 'bold' };
    }

    return {};
  };

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onFinishDrag();
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        onFinishDrag();
      }
    };

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.letters-row-view')) {
        onClearSelection();
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
  }, [isDragging, onFinishDrag, onClearSelection]);

  return (
    <div className="letters-row-view">
      <div className="letters-row-wrapper">
        <table
          className="letters-row-table"
          onTouchMove={handleTouchMove}
        >
        <tbody>
          <tr>
            {lettersRow.lettersArray.map((letter, index) => (
              <td
                key={index}
                className={getCellClassName(index)}
                style={getFirstLetterStyle(index)}
                onMouseDown={() => handleMouseDown(index)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseUp={handleMouseUp}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchEnd={handleTouchEnd}
              >
                {letter}
              </td>
            ))}
          </tr>
        </tbody>
        </table>
      </div>
    </div>
  );
});
