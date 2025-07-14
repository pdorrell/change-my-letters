import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordToFind } from '@/models/finders/word-to-find';

interface WordToFindViewProps {
  wordToFind: WordToFind;
  onSelect: () => void;
}

export const WordToFindView: React.FC<WordToFindViewProps> = observer(({ wordToFind, onSelect }) => {
  const getClassNames = (): string => {
    return clsx('word-to-find', `word-to-find--${wordToFind.displayState}`, {
      'word-to-find--clickable': wordToFind.canClick
    });
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
      {wordToFind.displayState === 'waiting' || wordToFind.displayState === 'active' || wordToFind.displayState === 'correct-active' ? '?' : ''}
    </div>
  );
});
