import React from 'react';
import { observer } from 'mobx-react-lite';
import { PositionInteraction } from '../models/interaction/PositionInteraction';
import { LetterChoiceMenu } from './CurrentWordView';
import { ActionButton } from '../lib/ui/ActionButton';

/**
 * Placeholder component that maintains the same dimensions as a position
 * but is invisible to the user
 */
export const PositionPlaceholder: React.FC = () => {
  return (
    <div className="position-container">
      <button className="insert-icon hidden" data-testid="position-view">➕</button>
    </div>
  );
};

/**
 * View component for displaying a position where letters can be inserted
 */
interface PositionViewProps { positionInteraction: PositionInteraction; }

export const PositionView: React.FC<PositionViewProps> = observer(({ positionInteraction }) => {
  const position = positionInteraction.position;

  return (
    <div className="position-container">
      <ActionButton
        ref={positionInteraction.insertButtonRef}
        action={positionInteraction.openInsertMenuAction}
        className={`insert-icon ${!positionInteraction.openInsertMenuAction.enabled ? 'hidden' : ''}`}
        title="Insert a letter here"
        data-testid="position-view"
      >
        ➕
      </ActionButton>

      {positionInteraction.isInsertMenuOpen && (
        <LetterChoiceMenu
          wordSelectionByLetter={positionInteraction.selectionOfLetterToInsert}
          previouslyVisited={positionInteraction.wordInteraction.appState.history.previouslyVisitedWords}
          menuManager={positionInteraction.menuManager}
        />
      )}
    </div>
  );
});
