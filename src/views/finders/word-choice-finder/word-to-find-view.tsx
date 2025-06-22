import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordToFind } from '@/models/finders/word-choice-finder/word-to-find';

interface WordToFindViewProps { wordToFind: WordToFind; }

export const WordToFindView: React.FC<WordToFindViewProps> = observer(({ wordToFind }) => {
  const getClassName = (): string => {
    return clsx('word-to-find', {
      waiting: wordToFind.state === 'waiting',
      current: wordToFind.state === 'current',
      wrong: wordToFind.state === 'wrong',
      right: wordToFind.state === 'right'
    });
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
