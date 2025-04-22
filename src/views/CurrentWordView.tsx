import React from 'react';
import { observer } from 'mobx-react-lite';
import { CurrentWord } from '../models/CurrentWord';
import { LetterView } from './LetterView';
import { PositionView } from './PositionView';

interface CurrentWordViewProps {
  currentWord: CurrentWord;
}

/**
 * View component for displaying the current word
 */
export const CurrentWordView: React.FC<CurrentWordViewProps> = observer(({ currentWord }) => {
  return (
    <div className="current-word-container">
      {currentWord.previouslyVisited && (
        <div className="word-visited-indicator">
          Previously visited
        </div>
      )}
      
      <div className="word-display">
        {/* Render alternating sequence of positions and letters */}
        {currentWord.positions.map((position, index) => (
          <React.Fragment key={`position-${index}`}>
            <PositionView position={position} />
            {index < currentWord.letters.length && (
              <LetterView letter={currentWord.letters[index]} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

/**
 * View component for the letter choice menu
 */
export const LetterChoiceMenu: React.FC<{ 
  options: string[],
  onSelect: (letter: string) => void
}> = ({ options, onSelect }) => {
  return (
    <div className="letter-choice-menu">
      {options.map((letter, index) => (
        <div 
          key={`option-${index}`}
          className="letter-choice-option"
          onClick={() => onSelect(letter)}
        >
          {letter}
        </div>
      ))}
    </div>
  );
};