import React from 'react';
import { observer } from 'mobx-react-lite';
import { Position } from '../models/Position';
import { LetterChoiceMenu } from './CurrentWordView';
import { getAppState } from '../App';

interface PositionViewProps {
  position: Position;
}

/**
 * View component for displaying a position where letters can be inserted
 */
export const PositionView: React.FC<PositionViewProps> = observer(({ position }) => {
  const appState = getAppState();
  
  const handleInsertClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    appState.openMenu('insert', position.index, event.currentTarget);
  };

  const handleLetterChoice = (letter: string) => {
    appState.insertLetter(position.index, letter);
    appState.closeAllMenus();
  };

  return (
    <div className="position-container">
      <button 
        onClick={(e) => handleInsertClick(e)}
        disabled={!position.canInsert}
        className={`insert-icon ${!position.canInsert ? 'hidden' : ''}`}
        title="Insert a letter here"
      >
        ➕
      </button>
      
      {position.isInsertMenuOpen && (
        <LetterChoiceMenu 
          options={position.insertOptions} 
          onSelect={handleLetterChoice}
          previouslyVisited={[]} // We'll add this functionality later
        />
      )}
    </div>
  );
});