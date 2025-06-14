import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordChoiceFinderInteraction } from '@/models/finders/word-choice-finder/word-choice-finder-interaction';
import { WordToChooseButton } from './word-to-choose-button';

interface WordToChoosePanelProps { finderInteraction: WordChoiceFinderInteraction; }

export const WordToChoosePanel: React.FC<WordToChoosePanelProps> = observer(({ finderInteraction }) => {
  return (
    <div className="finder-panel">
      <div className="words-grid">
        {finderInteraction.wordsToChoose.map((wordToChoose, index) => (
          <WordToChooseButton key={index} wordToChoose={wordToChoose} />
        ))}
      </div>
    </div>
  );
});
