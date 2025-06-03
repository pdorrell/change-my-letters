import React from 'react';
import { observer } from 'mobx-react-lite';
import { LetterInteraction } from '../models/interaction/letter-interaction';
import { LetterChoiceMenu } from './current-word';

/**
 * Placeholder component that maintains the same dimensions as a letter
 * but is invisible to the user
 */
export const LetterPlaceholder: React.FC = observer(() => {
  return (
    <div className="letter-container">
      <div className="letter hidden" data-testid="letter-view">
        x
      </div>
      <div className="letter-actions hidden">
        <button className="delete-icon hidden">🗑️</button>
        <button className="replace-icon hidden">🔄</button>
      </div>
    </div>
  );
});

/**
 * View component for displaying a single letter
 */
interface LetterViewProps { letterInteraction: LetterInteraction; }

export const LetterView: React.FC<LetterViewProps> = observer(({ letterInteraction }) => {
  const letter = letterInteraction.letter;

  // Delete action is now handled by letterInteraction.deleteAction
  // Replace action is now handled by letterInteraction.openReplaceMenuAction

  // Case change handler has been removed


  return (
    <div className={`letter-container ${letterInteraction.actionPending ? 'action-pending' : ''}`}>
      <div
        ref={letterInteraction.menuRef}
        className={`letter ${letterInteraction.letterClickAction.enabled ? 'clickable' : ''}`}
        onClick={letterInteraction.letterClickAction.enabled ? () => letterInteraction.letterClickAction.doAction() : undefined}
        title={letterInteraction.letterClickAction.tooltip}
      >
        {letter.value}
      </div>

      <div className="letter-actions">
        <div
          className={`delete-icon ${!letterInteraction.deleteAction.enabled ? 'hidden' : ''}`}
        >
          🗑️
        </div>

        <div
          className={`replace-icon ${!letterInteraction.openReplaceMenuAction.enabled ? 'hidden' : ''}`}
        >
          🔄
        </div>

        {/* Case change buttons have been removed */}
      </div>

      {letterInteraction.isReplaceMenuOpen && (
        <LetterChoiceMenu
          wordSelectionByLetter={letterInteraction.selectionOfReplacementLetter}
          menuManager={letterInteraction.menuManager}
          menuRef={letterInteraction.replaceMenuRef}
          deleteAction={letterInteraction.deleteAction.enabled ? letterInteraction.deleteAction : undefined}
        />
      )}
    </div>
  );
});
