import React from 'react';
import { observer } from 'mobx-react-lite';
import { Letter } from '../models/Letter';
import { LetterChoiceMenu } from './CurrentWordView';

interface LetterViewProps {
  letter: Letter;
}

/**
 * View component for displaying a single letter
 */
export const LetterView: React.FC<LetterViewProps> = observer(({ letter }) => {
  const handleReplaceClick = () => {
    letter.toggleReplaceMenu();
  };

  const handleDeleteClick = () => {
    // In a real implementation, this would modify the word
    console.log(`Delete letter ${letter.value} at position ${letter.position}`);
  };

  const handleCaseChange = () => {
    // In a real implementation, this would modify the word's case
    console.log(`Change case of letter ${letter.value} at position ${letter.position}`);
  };

  const handleLetterChoice = (newLetter: string) => {
    // In a real implementation, this would replace the letter
    console.log(`Replace letter ${letter.value} with ${newLetter}`);
    letter.toggleReplaceMenu();
  };

  return (
    <div className="letter-container">
      <div className="letter">
        {letter.value}
      </div>
      
      <div className="letter-actions">
        {letter.canDelete && (
          <button 
            className="delete-icon"
            onClick={handleDeleteClick}
            title="Delete this letter"
          >
            🗑️
          </button>
        )}
        
        {letter.canReplace && (
          <button 
            className="replace-icon"
            onClick={handleReplaceClick}
            title="Replace this letter"
          >
            🔄
          </button>
        )}
        
        {letter.canUpperCase && (
          <button 
            className="case-icon"
            onClick={handleCaseChange}
            title="Make uppercase"
          >
            ⬆️
          </button>
        )}
        
        {letter.canLowerCase && (
          <button 
            className="case-icon"
            onClick={handleCaseChange}
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
        />
      )}
    </div>
  );
});