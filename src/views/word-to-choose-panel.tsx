import React from 'react';
import { observer } from 'mobx-react-lite';
import { FinderInteraction } from '../models/finder-interaction';
import { WordToChooseButton } from './word-to-choose-button';

interface WordToChoosePanelProps { finderInteraction: FinderInteraction; }

export const WordToChoosePanel: React.FC<WordToChoosePanelProps> = observer(({ finderInteraction }) => {
  return (
    <div className="word-to-choose-panel">
      <h3>Choose the word you hear:</h3>
      <div className="word-to-choose-buttons">
        {finderInteraction.wordsToChoose.map((wordToChoose, index) => (
          <WordToChooseButton key={index} wordToChoose={wordToChoose} />
        ))}
      </div>
    </div>
  );
});
