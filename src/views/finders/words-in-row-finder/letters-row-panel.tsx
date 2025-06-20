import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordsInRowFinder } from '@/models/finders/words-in-row-finder/words-in-row-finder';
import { LettersRowView } from './letters-row-view';

interface LettersRowPanelProps { finder: WordsInRowFinder; }

export const LettersRowPanel: React.FC<LettersRowPanelProps> = observer(({ finder }) => {
  return (
    <div className="letters-row-panel touch-interactive-area">
      <LettersRowView
        selectable={finder}
        lettersRow={finder.lettersRow}
      />
    </div>
  );
});
