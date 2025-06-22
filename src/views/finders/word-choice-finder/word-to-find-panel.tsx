import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordChoiceFinderInteraction } from '@/models/finders/word-choice-finder/word-choice-finder-interaction';
import { WordToFindView } from './word-to-find-view';
import { ValueCheckbox } from '@/lib/views/value-model-views';

interface WordToFindPanelProps { finderInteraction: WordChoiceFinderInteraction; }

export const WordToFindPanel: React.FC<WordToFindPanelProps> = observer(({ finderInteraction }) => {
  return (
    <div className="finder-panel">
      <h3 title="Click to hear a word that you have to find">Find:</h3>
      <div className={clsx('word-to-find-buttons', 'touch-interactive-area')}>
        {finderInteraction.wordsToFind.map((wordToFind, index) => (
          <WordToFindView key={index} wordToFind={wordToFind} />
        ))}
      </div>
      <div className="finder-auto-checkbox">
        <ValueCheckbox value={finderInteraction.auto} />
      </div>
    </div>
  );
});
