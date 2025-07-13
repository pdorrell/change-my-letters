import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordChoiceFinder } from '@/models/finders/word-choice-finder/word-choice-finder';
import { WordToFindView } from './word-to-find-view';
import { ValueCheckbox } from '@/lib/views/value-model-views';
import { Panel } from '@/lib/views/panel';
import { GroupRight } from '@/lib/views/group-right';

interface WordToFindPanelProps { finder: WordChoiceFinder; }

export const WordToFindPanel: React.FC<WordToFindPanelProps> = observer(({ finder }) => {
  return (
    <Panel
      visible={true}
      inspectorTitle="WordToFindPanel"
      helpTitle="Target Words"
      helpContent="* Click on a word button to hear the target word you need to find\n* **Auto** - automatically choose the next word to find after finding one"
    >
      <h3 title="Click to hear a word that you have to find">Find:</h3>
      <div className={clsx('word-to-find-buttons', 'touch-interactive-area')}>
        {finder.wordsToFind.map((wordToFind, index) => (
          <WordToFindView key={index} wordToFind={wordToFind} />
        ))}
      </div>
      <GroupRight>
        <ValueCheckbox value={finder.auto} />
      </GroupRight>
    </Panel>
  );
});
