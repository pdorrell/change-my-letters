import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { PositionInteraction } from '@/models/interaction/position-interaction';
import { LetterChoiceMenu } from '@/views/word-changer';
import { ActionButton } from '@/lib/views/action-button';

/**
 * Placeholder component that maintains the same dimensions as a position
 * but is invisible to the user
 */
export const PositionPlaceholder: React.FC = observer(() => {
  return (
    <div className="position-container">
      <button className="insert-icon hidden" data-testid="position-view">➕</button>
    </div>
  );
});

/**
 * View component for displaying a position where letters can be inserted
 */
interface PositionViewProps { positionInteraction: PositionInteraction; }

export const PositionView: React.FC<PositionViewProps> = observer(({ positionInteraction }) => {
  return (
    <div className={clsx('position-container', { 'action-pending': positionInteraction.actionPending })}>
      <ActionButton
        ref={positionInteraction.insertButtonRef}
        action={positionInteraction.openInsertMenuAction}
        className={clsx('insert-icon', { hidden: !positionInteraction.openInsertMenuAction.enabled && !positionInteraction.alwaysShowInsertButton })}
        data-testid="position-view"
      >
        ➕
      </ActionButton>

      {positionInteraction.isInsertMenuOpen && (
        <LetterChoiceMenu
          wordSelectionByLetter={positionInteraction.selectionOfLetterToInsert}
          menuManager={positionInteraction.menuManager}
          menuRef={positionInteraction.insertMenuRef}
        />
      )}
    </div>
  );
});
