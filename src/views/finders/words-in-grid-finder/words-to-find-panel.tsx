import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordsInGridFinder } from '@/models/finders/words-in-grid-finder/words-in-grid-finder';
import { WordToFindView } from './word-to-find-view';
import { Inspectable } from '@/lib/inspector';

interface WordsToFindPanelProps { 
  finder: WordsInGridFinder; 
}

export const WordsToFindPanel: React.FC<WordsToFindPanelProps> = observer(({ finder }) => {
  if (!finder.wordsToFind) return null;

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