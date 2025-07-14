import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordsInRowFinder } from '@/models/finders/words-in-row-finder/words-in-row-finder';
import { LettersRowView } from './letters-row-view';
import { Panel } from '@/lib/views/panel';
import { Help } from '@/lib/components/help';

interface LettersRowPanelProps { finder: WordsInRowFinder; }

export const LettersRowPanel: React.FC<LettersRowPanelProps> = observer(({ finder }) => {
  return (
    <Panel
      visible={false}
      inspectorTitle="LettersRowPanel"
    >
      <Help title="Letters Row">{`
        Spell the word to find by clicking on the first letter of the word and dragging until you reach the last letter.`}
      </Help>
      <div className={clsx('letters-row-panel', 'touch-interactive-area')}>
        <LettersRowView
          selectable={finder}
          lettersRow={finder.lettersRow}
        />
      </div>
    </Panel>
  );
});
