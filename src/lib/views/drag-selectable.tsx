import React from 'react';
import { observer } from 'mobx-react-lite';
import { DragSelectionResult } from '@/lib/drag-selection';

// Reusable draggable table cell component
export interface DragSelectableTdProps {
  index: number;
  className: string;
  dragSelection: DragSelectionResult;
  children: React.ReactNode;
}

export const DragSelectableTd: React.FC<DragSelectableTdProps> = observer(({
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
    onTouchEnd={dragSelection.onTouchEnd}
  >
    {children}
  </td>
));
