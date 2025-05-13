import React from 'react';
import { observer } from 'mobx-react-lite';
import { Position } from '../models/Position';
import { LetterChoiceMenu } from './CurrentWordView';

interface PositionViewProps {
  position: Position;
}

/**
 * Placeholder component that maintains the same dimensions as a position
 * but is invisible to the user
 */
export const PositionPlaceholder: React.FC = () => {
  return (
    <div className="position-container">
      <button className="insert-icon hidden" data-testid="position-view">➕</button>
    </div>
  );
};

/**
 * View component for displaying a position where letters can be inserted
 */
export const PositionView: React.FC<PositionViewProps> = observer(({ position }) => {
  const appState = position.word.appState;

  const handleInsertClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Store appState reference on the button element for menu positioning
    (event.currentTarget as any).__appState = appState;
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