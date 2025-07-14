import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordsToFind } from '@/models/finders/words-to-find';
import { WordToFind } from '@/models/finders/word-to-find';
import { WordToFindView } from '@/views/finders/word-to-find-view';
import { Panel } from '@/lib/views/panel';
import { Help } from '@/lib/components/help';

interface WordsToFindFinderInterface {
  wordsToFind: WordsToFind;
  selectWordToFind(wordToFind: WordToFind): void;
}

interface WordsToFindPanelProps {
  finder: WordsToFindFinderInterface;
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
