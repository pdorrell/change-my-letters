import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordsInGridFinder } from '@/models/finders/words-in-grid-finder/words-in-grid-finder';
import { LettersGridView } from './letters-grid-view';
import { Panel } from '@/lib/views/panel';
import { Help } from '@/lib/components/help';

interface LettersGridPanelProps {
  finder: WordsInGridFinder;
}

export const LettersGridPanel: React.FC<LettersGridPanelProps> = observer(({ finder }) => {
  if (!finder.lettersGrid) return null;

  return (
    <Panel
      visible={false}
      inspectorTitle="LettersGridPanel"
    >
      <Help title="Letters Grid">{`
      Spell the word to find by clicking on the first letter of the word and dragging (horizontally only) until you reach the last letter.`}
      </Help>
      <div className="letters-grid-panel touch-interactive-area">
        <LettersGridView
          selectable={finder}
          lettersGrid={finder.lettersGrid}
        />
      </div>
    </Panel>
  );
});
