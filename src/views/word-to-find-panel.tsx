import React from 'react';
import { observer } from 'mobx-react-lite';
import { FinderInteraction } from '../models/finder-interaction';
import { WordToFindView } from './word-to-find-view';

interface WordToFindPanelProps { finderInteraction: FinderInteraction; }

export const WordToFindPanel: React.FC<WordToFindPanelProps> = observer(({ finderInteraction }) => {
  return (
    <div className="word-to-find-panel">
      <h3>Click to hear a word:</h3>
      <div className="word-to-find-buttons">
        {finderInteraction.wordsToFind.map((wordToFind, index) => (
          <WordToFindView key={index} wordToFind={wordToFind} />
        ))}
      </div>
    </div>
  );
});
