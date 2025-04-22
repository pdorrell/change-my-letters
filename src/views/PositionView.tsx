import React from 'react';
import { observer } from 'mobx-react-lite';
import { Position } from '../models/Position';
import { LetterChoiceMenu } from './CurrentWordView';

interface PositionViewProps {
  position: Position;
}

/**
 * View component for displaying a position where letters can be inserted
 */
export const PositionView: React.FC<PositionViewProps> = observer(({ position }) => {
  const handleInsertClick = () => {
    position.toggleInsertMenu();
  };

  const handleLetterChoice = (letter: string) => {
    // In a real implementation, this would insert the letter
    console.log(`Insert letter ${letter} at position ${position.index}`);
    position.toggleInsertMenu();
  };

  return (
    <div className="position-container">
      {position.canInsert && (
        <button 
          className="insert-icon"
          onClick={handleInsertClick}
          title="Insert a letter here"
        >
          ➕
        </button>
      )}
      
      {position.isInsertMenuOpen && (
        <LetterChoiceMenu 
          options={position.insertOptions} 
          onSelect={handleLetterChoice}
        />
      )}
    </div>
  );
});