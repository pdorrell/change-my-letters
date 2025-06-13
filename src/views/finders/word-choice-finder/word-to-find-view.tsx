import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordToFind } from '@/models/finders/word-choice-finder/word-to-find';

interface WordToFindViewProps { wordToFind: WordToFind; }

export const WordToFindView: React.FC<WordToFindViewProps> = observer(({ wordToFind }) => {
  const getClassName = (): string => {
    let className = 'word-to-find';
    switch (wordToFind.state) {
      case 'waiting':
        className += ' waiting';
        break;
      case 'current':
        className += ' current';
        break;
      case 'wrong':
        className += ' wrong';
        break;
      case 'right':
        className += ' right';
        break;
    }

    return className;
  };

  const getDisplayText = (): string => {
    return wordToFind.state === 'right' || wordToFind.state === 'wrong' ? '' : '?';
  };

  return (
    <button
      className={getClassName()}
      onClick={wordToFind.canSetToFind ? () => wordToFind.setToFind() : undefined}
      disabled={!wordToFind.canSetToFind}
      title={wordToFind.canSetToFind ? `Listen to word ${wordToFind.word}` : `${wordToFind.word} (already tried)`}
    >
      {getDisplayText()}
    </button>
  );
});
