import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordsInRowFinder } from '@/models/finders/words-in-row-finder/words-in-row-finder';
import { WordToFindView } from './word-to-find-view';
import { Inspectable } from '@/lib/inspector';

interface WordsToFindPanelProps { finder: WordsInRowFinder; }

export const WordsToFindPanel: React.FC<WordsToFindPanelProps> = observer(({ finder }) => {
  return (
    <Inspectable name="WordsToFindPanel">
      <div className={clsx('words-to-find-panel', 'touch-interactive-area')}>
        {finder.wordsToFind.words.map((wordToFind, index) => (
          <WordToFindView
            key={index}
            wordToFind={wordToFind}
            onSelect={() => finder.selectWordToFind(wordToFind)}
          />
        ))}
      </div>
    </Inspectable>
  );
});

