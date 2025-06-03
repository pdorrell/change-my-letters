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
        onClick={letterInteraction.letterClickAction.enabled ? (e) => {
          // Ensure the click is handled regardless of what element was clicked
          e.preventDefault();
          e.stopPropagation();
          letterInteraction.letterClickAction.doAction();
        } : undefined}
        title={letterInteraction.letterClickAction.tooltip}
      >
        <span
          className="letter-text"
          onClick={letterInteraction.letterClickAction.enabled ? (e) => {
            e.preventDefault();
            e.stopPropagation();
            letterInteraction.letterClickAction.doAction();
          } : undefined}
        >
          {letter.value}
        </span>

        <div
          className={`delete-icon-inside ${!letterInteraction.deleteAction.enabled ? 'hidden' : ''}`}
          onClick={letterInteraction.letterClickAction.enabled ? (e) => {
            e.preventDefault();
            e.stopPropagation();
            letterInteraction.letterClickAction.doAction();
          } : undefined}
        >
          🗑️
        </div>

        <div
          className={`replace-icon-inside ${!letterInteraction.openReplaceMenuAction.enabled ? 'hidden' : ''}`}
          onClick={letterInteraction.letterClickAction.enabled ? (e) => {
            e.preventDefault();
            e.stopPropagation();
            letterInteraction.letterClickAction.doAction();
          } : undefined}
        >
          🔄
        </div>
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
