import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordChoiceFinder } from '@/models/finders/word-choice-finder/word-choice-finder';
import { WordToChooseButton } from './word-to-choose-button';
import { Panel } from '@/lib/views/panel';
import { Help } from '@/lib/components/help';

interface WordToChoosePanelProps { finder: WordChoiceFinder; }

export const WordToChoosePanel: React.FC<WordToChoosePanelProps> = observer(({ finder }) => {
  return (
    <Panel
      visible={true}
      inspectorTitle="WordToChoosePanel"
    >
      <Help title="Word Choice Grid">{`
      When you hear the word to find, click on the correct word.`}
      </Help>
      <div className={clsx('words-grid', 'touch-interactive-area')}>
        {finder.wordsToChoose.map((wordToChoose, index) => (
          <WordToChooseButton key={index} wordToChoose={wordToChoose} />
        ))}
      </div>
    </Panel>
  );
});
