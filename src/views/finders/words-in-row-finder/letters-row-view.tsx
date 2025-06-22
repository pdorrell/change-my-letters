import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
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
    const selection = lettersRow.selection;
    const isInSelection = selection && index >= selection.start && index <= selection.end;
    const wordStart = getWordFirstPosition();

    return clsx('letters-row-cell', {
      'letters-row-cell--disabled': lettersRow.interactionsDisabled,
      'letters-row-cell--dragging': isInSelection && lettersRow.selectionState,
      'letters-row-cell--correct': isInSelection && lettersRow.correctSelection,
      'letters-row-cell--wrong': isInSelection && lettersRow.wrongSelection,
      'letters-row-cell--drag-start': selection && index === selection.start,
      'letters-row-cell--drag-end': selection && index === selection.end,
      'letters-row-cell--word-first': (
        (lettersRow.selectionState && index === lettersRow.selectionState.start) ||
        ((lettersRow.correctSelection || lettersRow.wrongSelection) &&
         lettersRow.selectionState === null &&
         wordStart !== null &&
         index === wordStart)
      )
    });
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
