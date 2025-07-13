import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordsInRowFinder } from '@/models/finders/words-in-row-finder/words-in-row-finder';
import { WordToFindView } from './word-to-find-view';
import { Panel } from '@/lib/views/panel';
import { Help } from '@/lib/components/help';

interface WordsToFindPanelProps { finder: WordsInRowFinder; }

export const WordsToFindPanel: React.FC<WordsToFindPanelProps> = observer(({ finder }) => {
  return (
    <Panel
      visible={true}
      inspectorTitle="WordsToFindPanel"
    >
      <Help title="Words to Find">
        These are the words hidden in the letter grid. Click on a word to hear it pronounced and highlight it as your current target.
      </Help>
      <div className={clsx('words-to-find-panel', 'touch-interactive-area')}>
        {finder.wordsToFind.words.map((wordToFind, index) => (
          <WordToFindView
            key={index}
            wordToFind={wordToFind}
            onSelect={() => finder.selectWordToFind(wordToFind)}
          />
        ))}
      </div>
    </Panel>
  );
});

