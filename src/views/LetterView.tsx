import React from 'react';
import { observer } from 'mobx-react-lite';
import { Letter } from '../models/Letter';
import { LetterChoiceMenu } from './CurrentWordView';
import { getAppState } from '../App';

interface LetterViewProps {
  letter: Letter;
}

/**
 * View component for displaying a single letter
 */
export const LetterView: React.FC<LetterViewProps> = observer(({ letter }) => {
  const appState = getAppState();
  
  const handleReplaceClick = () => {
    appState.openMenu('replace', letter.position);
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
        {letter.canDelete && (
          <button 
            onClick={handleDeleteClick}
            className="delete-icon"
            title="Delete this letter"
          >
            🗑️
          </button>
        )}
        
        {letter.canReplace && (
          <button 
            onClick={handleReplaceClick}
            className="replace-icon"
            title="Replace this letter"
          >
            🔄
          </button>
        )}
        
        {letter.canUpperCase && (
          <button 
            onClick={handleCaseChange}
            className="case-icon"
            title="Make uppercase"
          >
            ⬆️
          </button>
        )}
        
        {letter.canLowerCase && (
          <button 
            onClick={handleCaseChange}
            className="case-icon"
            title="Make lowercase"
          >
            ⬇️
          </button>
        )}
      </div>
      
      {letter.isReplaceMenuOpen && (
        <LetterChoiceMenu 
          options={letter.replacements.length ? letter.replacements : ['a', 'b', 'c']} 
          onSelect={handleLetterChoice}
          previouslyVisited={[]} // We'll add this functionality later
        />
      )}
    </div>
  );
});