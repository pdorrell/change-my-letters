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

  const handleMouseDown = useCallback((position: number) => {
    setIsDragging(true);
    onStartDrag(position);
  }, [onStartDrag]);

  const handleMouseEnter = useCallback((position: number) => {
    if (isDragging) {
      onUpdateDrag(position);
    }
  }, [isDragging, onUpdateDrag]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onFinishDrag();
    }
  }, [isDragging, onFinishDrag]);

  const getCellClassName = (index: number): string => {
    const baseClass = 'letters-row-cell';
    const selection = lettersRow.draggedSelection;
    const classes = [baseClass];

    if (selection && index >= selection.start && index <= selection.end) {
      if (lettersRow.dragState) {
        classes.push('letters-row-cell--dragging');
      } else {
        classes.push('letters-row-cell--correct');
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

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.letters-row-view')) {
        onClearSelection();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [isDragging, onFinishDrag, onClearSelection]);

  return (
    <div className="letters-row-view">
      <table className="letters-row-table">
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
              >
                {letter}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
});
