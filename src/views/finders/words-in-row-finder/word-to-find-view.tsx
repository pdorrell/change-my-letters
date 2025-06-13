import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordToFind } from '@/models/finders/words-in-row-finder/word-to-find';

interface WordToFindViewProps {
  wordToFind: WordToFind;
  onSelect: () => void;
}

export const WordToFindView: React.FC<WordToFindViewProps> = observer(({ wordToFind, onSelect }) => {
  const getClassNames = (): string => {
    const baseClass = 'word-to-find';
    const stateClass = `word-to-find--${wordToFind.displayState}`;
    const clickableClass = wordToFind.canClick ? 'word-to-find--clickable' : '';

    return [baseClass, stateClass, clickableClass].filter(Boolean).join(' ');
  };

  const handleClick = (): void => {
    if (wordToFind.canClick) {
      onSelect();
    }
  };

  return (
    <div
      className={getClassNames()}
      onClick={handleClick}
      style={{
        cursor: wordToFind.canClick ? 'pointer' : 'default'
      }}
    >
      {/* No text displayed - only background color shows the state */}
    </div>
  );
});
