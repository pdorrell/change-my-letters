import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordChoiceFinder } from '@/models/finders/word-choice-finder/word-choice-finder';
import { WordToChooseButton } from './word-to-choose-button';

interface WordToChoosePanelProps { finder: WordChoiceFinder; }

export const WordToChoosePanel: React.FC<WordToChoosePanelProps> = observer(({ finder }) => {
  return (
    <div className="finder-panel">
      <div className={clsx('words-grid', 'touch-interactive-area')}>
        {finder.wordsToChoose.map((wordToChoose, index) => (
          <WordToChooseButton key={index} wordToChoose={wordToChoose} />
        ))}
      </div>
    </div>
  );
});
