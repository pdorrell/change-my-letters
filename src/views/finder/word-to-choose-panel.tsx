import React from 'react';
import { observer } from 'mobx-react-lite';
import { FinderInteraction } from '@/models/finder/finder-interaction';
import { WordToChooseButton } from '@/views/finder/word-to-choose-button';

interface WordToChoosePanelProps { finderInteraction: FinderInteraction; }

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
