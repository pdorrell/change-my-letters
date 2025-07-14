import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordsInGridFinder } from '@/models/finders/words-in-grid-finder/words-in-grid-finder';
import { WordToFindView } from '@/views/finders/word-to-find-view';
import { Panel } from '@/lib/views/panel';
import { Help } from '@/lib/components/help';

interface WordsToFindPanelProps {
  finder: WordsInGridFinder;
}

export const WordsToFindPanel: React.FC<WordsToFindPanelProps> = observer(({ finder }) => {
  return (
    <Panel
      visible={true}
      inspectorTitle="WordsToFindPanel"
    >
      <Help title="Words to Find">{`
      * Click on a "?" button to select the next word to find.
      * You can click the button again to hear the word again.`}
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
