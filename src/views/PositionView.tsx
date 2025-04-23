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
  
  const handleInsertClick = () => {
    appState.openMenu('insert', position.index);
  };

  const handleLetterChoice = (letter: string) => {
    appState.insertLetter(position.index, letter);
    appState.closeAllMenus();
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
          previouslyVisited={[]} // We'll add this functionality later
        />
      )}
    </div>
  );
});