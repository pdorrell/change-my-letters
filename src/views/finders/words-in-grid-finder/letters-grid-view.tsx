import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { RangeSelectable } from '@/lib/models/range-selectable';
import { useDragSelection } from '@/lib/drag-selection';
import { DragSelectableTd } from '@/lib/views/drag-selectable';
import { LettersGrid } from '@/models/finders/words-in-grid-finder/letters-grid';
import { GridPosition } from '@/models/finders/words-in-grid-finder/types';
import { Inspectable } from '@/lib/inspector';

interface LettersGridViewProps {
  selectable: RangeSelectable;
  lettersGrid: LettersGrid;
}

export const LettersGridView: React.FC<LettersGridViewProps> = observer(({
  selectable,
  lettersGrid
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Use the generic drag selection hook
  const dragSelection = useDragSelection(
    selectable,
    containerRef
  );

  const getWordFirstPosition = (): number | null => {
    // For completed selections, we need to determine which end was the starting position
    if (lettersGrid.correctSelection) {
      return lettersGrid.correctSelectionStart ?? null;
    }
    if (lettersGrid.wrongSelection) {
      return lettersGrid.wrongSelectionStart ?? null;
    }
    return null;
  };

  const gridPositionToIndex = (position: GridPosition): number => {
    return position.row * lettersGrid.gridSize + position.col;
  };

  const getCellClassName = (index: number): string => {
    const selection = lettersGrid.selection;
    const isInCurrentSelection = selection && index >= selection.start && index <= selection.end;
    const isInAnyCorrectSelection = lettersGrid.isIndexInAnyCorrectSelection(index);
    const isInAnyWrongSelection = lettersGrid.isIndexInAnyWrongSelection(index);
    const wordStart = getWordFirstPosition();

    // Check if this index is the start or end of any completed selection
    const isSelectionStart = (selection && index === selection.start) ||
      lettersGrid.correctSelections.some(sel => {
        const indices = sel.positions.map(pos => pos.row * lettersGrid.gridSize + pos.col);
        return index === Math.min(...indices);
      }) ||
      lettersGrid.wrongSelections.some(sel => {
        const indices = sel.positions.map(pos => pos.row * lettersGrid.gridSize + pos.col);
        return index === Math.min(...indices);
      });

    const isSelectionEnd = (selection && index === selection.end) ||
      lettersGrid.correctSelections.some(sel => {
        const indices = sel.positions.map(pos => pos.row * lettersGrid.gridSize + pos.col);
        return index === Math.max(...indices);
      }) ||
      lettersGrid.wrongSelections.some(sel => {
        const indices = sel.positions.map(pos => pos.row * lettersGrid.gridSize + pos.col);
        return index === Math.max(...indices);
      });

    return clsx('letters-row-cell', {
      'letters-row-cell--disabled': lettersGrid.interactionsDisabled,
      'letters-row-cell--dragging': isInCurrentSelection && lettersGrid.selectionState,
      'letters-row-cell--correct': isInAnyCorrectSelection,
      'letters-row-cell--wrong': isInAnyWrongSelection && !isInAnyCorrectSelection,
      'letters-row-cell--drag-start': isSelectionStart,
      'letters-row-cell--drag-end': isSelectionEnd,
      'letters-row-cell--word-first': (
        (lettersGrid.selectionState && index === gridPositionToIndex(lettersGrid.selectionState.start)) ||
        ((lettersGrid.correctSelection || lettersGrid.wrongSelection) &&
         lettersGrid.selectionState === null &&
         wordStart !== null &&
         index === wordStart)
      )
    });
  };

  // Render the grid as a 10x10 table
  const renderGridRows = () => {
    const rows = [];
    const gridSize = lettersGrid.gridSize;

    for (let row = 0; row < gridSize; row++) {
      const cells = [];
      for (let col = 0; col < gridSize; col++) {
        const index = row * gridSize + col;
        const letter = lettersGrid.lettersArray[index];

        cells.push(
          <DragSelectableTd
            key={index}
            index={index}
            className={getCellClassName(index)}
            dragSelection={dragSelection}
          >
            {letter}
          </DragSelectableTd>
        );
      }

      rows.push(
        <tr key={row}>
          {cells}
        </tr>
      );
    }

    return rows;
  };

  return (
    <Inspectable name="LettersGridView">
      <div className="letters-grid-view" ref={containerRef}>
        <div className="letters-row-wrapper">
          <table
            className="letters-row-table"
            onTouchMove={dragSelection.onTouchMove}
          >
            <tbody>
              {renderGridRows()}
            </tbody>
          </table>
        </div>
      </div>
    </Inspectable>
  );
});
