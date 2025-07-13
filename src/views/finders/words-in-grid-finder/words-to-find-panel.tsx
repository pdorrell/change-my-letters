import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordsInGridFinder } from '@/models/finders/words-in-grid-finder/words-in-grid-finder';
import { WordToFindView } from './word-to-find-view';
import { Panel } from '@/lib/views/panel';

interface WordsToFindPanelProps {
  finder: WordsInGridFinder;
}

export const WordsToFindPanel: React.FC<WordsToFindPanelProps> = observer(({ finder }) => {
  if (!finder.wordsToFind) return null;

  return (
    <Panel 
      visible={false} 
      inspectorTitle="WordsToFindPanel"
      helpTitle="Words to Find"
      helpContent="These are the words you need to find in the letter grid. Click on a word to select it as your target, then search for it in the grid above. The word will be highlighted in orange when selected. Found words appear with a green checkmark. If a word is pronounced when you click it, listen and then find it in the grid."
    >
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
