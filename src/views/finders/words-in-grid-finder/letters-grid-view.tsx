import React, { useState, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { LettersGrid } from '@/models/finders/words-in-grid-finder/letters-grid';
import { GridPosition } from '@/models/finders/words-in-grid-finder/types';
import { Inspectable } from '@/lib/inspector';

interface LettersGridViewProps {
  grid: LettersGrid;
  forwardsOnly: boolean;
  onSelection: (selectedText: string) => void;
}

export const LettersGridView: React.FC<LettersGridViewProps> = observer(({ grid, forwardsOnly, onSelection }) => {
  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const getPositionFromElement = useCallback((element: HTMLElement): GridPosition | null => {
    const row = parseInt(element.dataset.row || '', 10);
    const col = parseInt(element.dataset.col || '', 10);
    
    if (isNaN(row) || isNaN(col)) {
      return null;
    }
    
    return { row, col };
  }, []);

  const findCellAtPoint = useCallback((x: number, y: number): HTMLElement | null => {
    const elements = document.elementsFromPoint(x, y);
    return elements.find(el => el.classList.contains('letters-grid-cell')) as HTMLElement || null;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left clicks
    
    const target = e.target as HTMLElement;
    if (!target.classList.contains('letters-grid-cell')) return;
    
    const position = getPositionFromElement(target);
    if (!position) return;
    
    setIsDragging(true);
    grid.startSelection(position, forwardsOnly);
    e.preventDefault();
  }, [grid, forwardsOnly, getPositionFromElement]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !grid.currentSelection) return;
    
    const cell = findCellAtPoint(e.clientX, e.clientY);
    if (!cell) return;
    
    const position = getPositionFromElement(cell);
    if (!position) return;
    
    grid.updateSelection(position);
  }, [isDragging, grid, findCellAtPoint, getPositionFromElement]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !grid.currentSelection) return;
    
    const selectedText = grid.finishSelection();
    setIsDragging(false);
    
    if (selectedText) {
      onSelection(selectedText);
    }
  }, [isDragging, grid, onSelection]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      grid.cancelSelection();
      setIsDragging(false);
    }
  }, [isDragging, grid]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
    
    if (!target || !target.classList.contains('letters-grid-cell')) return;
    
    const position = getPositionFromElement(target);
    if (!position) return;
    
    setIsDragging(true);
    grid.startSelection(position, forwardsOnly);
    e.preventDefault();
  }, [grid, forwardsOnly, getPositionFromElement]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !grid.currentSelection || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const cell = findCellAtPoint(touch.clientX, touch.clientY);
    if (!cell) return;
    
    const position = getPositionFromElement(cell);
    if (!position) return;
    
    grid.updateSelection(position);
    e.preventDefault();
  }, [isDragging, grid, findCellAtPoint, getPositionFromElement]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !grid.currentSelection) return;
    
    const selectedText = grid.finishSelection();
    setIsDragging(false);
    
    if (selectedText) {
      onSelection(selectedText);
    }
  }, [isDragging, grid, onSelection]);

  const getCellClassName = useCallback((row: number, col: number): string => {
    const position = { row, col };
    const state = grid.getCellState(position);
    
    return clsx('letters-grid-cell', {
      'letters-grid-cell--selecting': state === 'selecting',
      'letters-grid-cell--correct': state === 'correct',
      'letters-grid-cell--wrong': state === 'wrong'
    });
  }, [grid]);

  return (
    <Inspectable name="LettersGridView">
      <div
        ref={gridRef}
        className={clsx('letters-grid', 'touch-interactive-area')}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {grid.grid.map((row, rowIndex) => (
          <div key={rowIndex} className="letters-grid-row">
            {row.map((letter, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClassName(rowIndex, colIndex)}
                data-row={rowIndex}
                data-col={colIndex}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Inspectable>
  );
});