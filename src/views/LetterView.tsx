import React from 'react';
import { observer } from 'mobx-react-lite';
import { LetterInteraction } from '../models/interaction/LetterInteraction';
import { LetterChoiceMenu } from './CurrentWordView';
import { Word } from '../models/Word';

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
  const appState = letterInteraction.wordInteraction.appState;
  const replaceButtonRef = React.useRef<HTMLButtonElement>(null);

  const handleReplaceClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    letterInteraction.menuManager.toggleMenu(
      letterInteraction.isReplaceMenuOpen,
      () => { letterInteraction.isReplaceMenuOpen = true; },
      event.currentTarget
    );
  };

  const handleDeleteClick = () => {
    if (letter.changes.deleteChange) {
      letterInteraction.setNewWord(letter.changes.deleteChange.result);
    }
  };

  // Case change handler has been removed

  const handleWordChoice = (newWord: Word) => {
    letterInteraction.setNewWord(newWord);
  };

  return (
    <div className="letter-container">
      <div className="letter">
        {letter.value}
      </div>

      <div className="letter-actions">
        <button
          onClick={handleDeleteClick}
          disabled={!letter.canDelete}
          className={`delete-icon ${!letter.canDelete ? 'hidden' : ''}`}
          title="Delete this letter"
        >
          🗑️
        </button>

        <button
          ref={replaceButtonRef}
          onClick={(e) => handleReplaceClick(e)}
          disabled={!letter.canReplace}
          className={`replace-icon ${!letter.canReplace ? 'hidden' : ''}`}
          title="Replace this letter"
        >
          🔄
        </button>

        {/* Case change buttons have been removed */}
      </div>

      {letterInteraction.isReplaceMenuOpen && (
        <LetterChoiceMenu
          options={letter.changes.replaceChanges}
          onSelect={handleWordChoice}
          previouslyVisited={[]} // We'll add this functionality later
          menuManager={letterInteraction.menuManager}
        />
      )}
    </div>
  );
});
