import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordsInRowFinder } from '@/models/finders/words-in-row-finder/words-in-row-finder';
import { WordToFindView } from './word-to-find-view';

interface WordsToFindPanelProps { finder: WordsInRowFinder; }

export const WordsToFindPanel: React.FC<WordsToFindPanelProps> = observer(({ finder }) => {
  return (
    <div className="words-to-find-panel">
      {finder.wordsToFind.words.map((wordToFind, index) => (
        <WordToFindView
          key={index}
          wordToFind={wordToFind}
          onSelect={() => finder.selectWordToFind(wordToFind)}
        />
      ))}
    </div>
  );
});

