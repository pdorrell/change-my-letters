import React from 'react';
import { observer } from 'mobx-react-lite';
import { Letter } from '../models/Letter';
import { LetterChoiceMenu } from './CurrentWordView';

interface LetterViewProps {
  letter: Letter;
}

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
export const LetterView: React.FC<LetterViewProps> = observer(({ letter }) => {
  const appState = letter.word.appState;

  const handleReplaceClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    appState.openMenu('replace', letter.position, event.currentTarget);
  };

  const handleDeleteClick = () => {
    appState.deleteLetter(letter.position);
  };

  const handleCaseChange = () => {
    if (letter.canUpperCase) {
      appState.changeLetterCase(letter.position, true);
    } else if (letter.canLowerCase) {
      appState.changeLetterCase(letter.position, false);
    }
  };

  const handleLetterChoice = (newLetter: string) => {
    appState.replaceLetter(letter.position, newLetter);
    appState.closeAllMenus();
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
          onClick={(e) => handleReplaceClick(e)}
          disabled={!letter.canReplace}
          className={`replace-icon ${!letter.canReplace ? 'hidden' : ''}`}
          title="Replace this letter"
        >
          🔄
        </button>

        <button
          onClick={handleCaseChange}
          disabled={!letter.canUpperCase}
          className={`case-icon ${!letter.canUpperCase ? 'hidden' : ''}`}
          title="Make uppercase"
        >
          ⬆️
        </button>

        <button
          onClick={handleCaseChange}
          disabled={!letter.canLowerCase}
          className={`case-icon ${!letter.canLowerCase ? 'hidden' : ''}`}
          title="Make lowercase"
        >
          ⬇️
        </button>
      </div>

      {letter.isReplaceMenuOpen && (
        <LetterChoiceMenu
          options={letter.replacements}
          onSelect={handleLetterChoice}
          previouslyVisited={[]} // We'll add this functionality later
          word={letter.word}
        />
      )}
    </div>
  );
});