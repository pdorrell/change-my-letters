import React from 'react';
import { observer } from 'mobx-react-lite';
import { PositionInteraction } from '../models/interaction/PositionInteraction';
import { LetterChoiceMenu } from './CurrentWordView';

interface PositionViewProps {
  positionInteraction: PositionInteraction;
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
export const PositionView: React.FC<PositionViewProps> = observer(({ positionInteraction }) => {
  const position = positionInteraction.position;
  const appState = positionInteraction.wordInteraction.appState;
  const insertButtonRef = React.useRef<HTMLButtonElement>(null);

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
        ref={insertButtonRef}
        onClick={(e) => handleInsertClick(e)}
        disabled={!position.canInsert}
        className={`insert-icon ${!position.canInsert ? 'hidden' : ''}`}
        title="Insert a letter here"
        data-testid="position-view"
      >
        ➕
      </button>

      {positionInteraction.isInsertMenuOpen && (
        <LetterChoiceMenu
          options={position.insertOptions}
          onSelect={handleLetterChoice}
          previouslyVisited={[]} // We'll add this functionality later
          wordInteraction={positionInteraction.wordInteraction}
        />
      )}
    </div>
  );
});