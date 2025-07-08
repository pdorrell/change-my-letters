import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordsInGridFinder } from '@/models/finders/words-in-grid-finder/words-in-grid-finder';
import { LettersGridView } from './letters-grid-view';
import { Inspectable } from '@/lib/inspector';

interface LettersGridPanelProps {
  finder: WordsInGridFinder;
}

export const LettersGridPanel: React.FC<LettersGridPanelProps> = observer(({ finder }) => {
  if (!finder.lettersGrid) return null;

  return (
    <Inspectable name="LettersGridPanel">
      <div className="letters-grid-panel">
        <LettersGridView
          grid={finder.lettersGrid}
          forwardsOnly={finder.forwardsOnly.value}
          onSelection={(selectedText) => finder.handleGridSelection(selectedText)}
        />
      </div>
    </Inspectable>
  );
});
