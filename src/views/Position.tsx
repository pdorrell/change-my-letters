import React from 'react';
import { observer } from 'mobx-react-lite';
import { PositionInteraction } from '@/models/interaction/position-interaction';
import { LetterChoiceMenu } from '@/views/current-word';
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
    <div className={`position-container ${positionInteraction.actionPending ? 'action-pending' : ''}`}>
      <ActionButton
        ref={positionInteraction.insertButtonRef}
        action={positionInteraction.openInsertMenuAction}
        className={`insert-icon ${!positionInteraction.openInsertMenuAction.enabled ? 'hidden' : ''}`}
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
