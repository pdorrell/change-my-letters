import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordChoiceFinder } from '@/models/finders/word-choice-finder/word-choice-finder';
import { WordToFindView } from './word-to-find-view';
import { ValueCheckbox } from '@/lib/views/value-model-views';

interface WordToFindPanelProps { finder: WordChoiceFinder; }

export const WordToFindPanel: React.FC<WordToFindPanelProps> = observer(({ finder }) => {
  return (
    <div className="finder-panel">
      <h3 title="Click to hear a word that you have to find">Find:</h3>
      <div className={clsx('word-to-find-buttons', 'touch-interactive-area')}>
        {finder.wordsToFind.map((wordToFind, index) => (
          <WordToFindView key={index} wordToFind={wordToFind} />
        ))}
      </div>
      <div className="finder-auto-checkbox">
        <ValueCheckbox value={finder.auto} />
      </div>
    </div>
  );
});
