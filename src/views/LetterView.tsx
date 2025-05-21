import React from 'react';
import { observer } from 'mobx-react-lite';
import { LetterInteraction } from '../models/interaction/LetterInteraction';
import { LetterChoiceMenu } from './CurrentWordView';
import { ActionButton } from '../lib/ui/ActionButton';

/**
 * Placeholder component that maintains the same dimensions as a letter
 * but is invisible to the user
 */
export const LetterPlaceholder: React.FC = () => {
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
};

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
    <div className="letter-container">
      <div className="letter">
        {letter.value}
      </div>

      <div className="letter-actions">
        <ActionButton
          action={letterInteraction.deleteAction}
          className={`delete-icon ${!letterInteraction.deleteAction.enabled ? 'hidden' : ''}`}
          title="Delete this letter"
        >
          🗑️
        </ActionButton>

        <ActionButton
          ref={letterInteraction.replaceButtonRef}
          action={letterInteraction.openReplaceMenuAction}
          className={`replace-icon ${!letterInteraction.openReplaceMenuAction.enabled ? 'hidden' : ''}`}
          title="Replace this letter"
        >
          🔄
        </ActionButton>

        {/* Case change buttons have been removed */}
      </div>

      {letterInteraction.isReplaceMenuOpen && (
        <LetterChoiceMenu
          options={letter.changes.replaceChanges}
          onSelect={(word) => letterInteraction.setNewWord(word)}
          previouslyVisited={Array.from(letterInteraction.wordInteraction.appState.history.previouslyVisitedWords)}
          menuManager={letterInteraction.menuManager}
        />
      )}
    </div>
  );
});
