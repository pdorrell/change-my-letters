import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordsInGridFinder } from '@/models/finders/words-in-grid-finder/words-in-grid-finder';
import { LettersGridView } from './letters-grid-view';
import { Panel } from '@/lib/views/panel';

interface LettersGridPanelProps {
  finder: WordsInGridFinder;
}

export const LettersGridPanel: React.FC<LettersGridPanelProps> = observer(({ finder }) => {
  if (!finder.lettersGrid) return null;

  return (
    <Panel
      visible={false}
      inspectorTitle="LettersGridPanel"
      helpTitle="Letters Grid"
      helpContent="This is the letter grid where you find words. Click and drag to select letters and form words. First click a word in the words panel to target it, then drag across the letters in the grid to spell that word. Words can be horizontal, vertical, or diagonal. Correct selections are highlighted in green, incorrect ones briefly in red."
    >
      <div className="letters-grid-panel touch-interactive-area">
        <LettersGridView
          selectable={finder}
          lettersGrid={finder.lettersGrid}
        />
      </div>
    </Panel>
  );
});
