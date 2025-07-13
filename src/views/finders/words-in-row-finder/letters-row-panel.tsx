import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordsInRowFinder } from '@/models/finders/words-in-row-finder/words-in-row-finder';
import { LettersRowView } from './letters-row-view';
import { Panel } from '@/lib/views/panel';

interface LettersRowPanelProps { finder: WordsInRowFinder; }

export const LettersRowPanel: React.FC<LettersRowPanelProps> = observer(({ finder }) => {
  return (
    <Panel
      visible={false}
      inspectorTitle="LettersRowPanel"
      helpTitle="Letter Grid"
      helpContent="Click and drag to select letters that spell out the target words. Words can be found horizontally, vertically, or diagonally depending on difficulty setting."
    >
      <div className={clsx('letters-row-panel', 'touch-interactive-area')}>
        <LettersRowView
          selectable={finder}
          lettersRow={finder.lettersRow}
        />
      </div>
    </Panel>
  );
});
