import React from 'react';
import { observer } from 'mobx-react-lite';
import { RangeSelectable } from '@/lib/models/range-selectable';
import { useDragSelection } from '@/lib/drag-selection';
import { DragSelectableTd } from '@/lib/views/drag-selectable';
import { LettersRow } from '@/models/finders/words-in-row-finder/letters-row';

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
