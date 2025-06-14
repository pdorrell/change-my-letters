import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordsInRowFinder } from '@/models/finders/words-in-row-finder/words-in-row-finder';
import { LettersRowView } from './letters-row-view';

interface LettersRowPanelProps { finder: WordsInRowFinder; }

export const LettersRowPanel: React.FC<LettersRowPanelProps> = observer(({ finder }) => {
  return (
    <div className="letters-row-panel">
      <LettersRowView
        lettersRow={finder.lettersRow}
        onStartDrag={finder.startSelection.bind(finder)}
        onUpdateDrag={finder.updateSelection.bind(finder)}
        onFinishDrag={finder.finishDrag.bind(finder)}
        onClearSelection={finder.clearSelection.bind(finder)}
      />
    </div>
  );
});
