import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordChoiceFinder } from '@/models/finders/word-choice-finder/word-choice-finder';
import { WordToChooseButton } from './word-to-choose-button';
import { Panel } from '@/lib/views/panel';

interface WordToChoosePanelProps { finder: WordChoiceFinder; }

export const WordToChoosePanel: React.FC<WordToChoosePanelProps> = observer(({ finder }) => {
  return (
    <Panel
      visible={true}
      inspectorTitle="WordToChoosePanel"
      helpTitle="Word Choice Grid"
      helpContent="This is your word choice grid. Click on the words that match the target word shown below. Choose all correct answers to score points. Each word can only be selected once, so choose carefully. Your score increases with correct choices and decreases with wrong ones."
    >
      <div className={clsx('words-grid', 'touch-interactive-area')}>
        {finder.wordsToChoose.map((wordToChoose, index) => (
          <WordToChooseButton key={index} wordToChoose={wordToChoose} />
        ))}
      </div>
    </Panel>
  );
});
