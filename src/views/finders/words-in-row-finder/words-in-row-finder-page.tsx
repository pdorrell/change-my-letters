import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordsInRowFinder } from '@/models/finders/words-in-row-finder/words-in-row-finder';
import { FinderControls } from './finder-controls';
import { WordsToFindPanel } from './words-to-find-panel';
import { LettersRowPanel } from './letters-row-panel';

interface WordsInRowFinderPageProps { wordsInRowFinder: WordsInRowFinder; }

export const WordsInRowFinderPage: React.FC<WordsInRowFinderPageProps> = observer(({ wordsInRowFinder }) => {
  return (
    <>
      <FinderControls finder={wordsInRowFinder} />
      <p>Click/touch any square in the bottom row to hear a word, then find the
           word in the line of letters.</p>
      <LettersRowPanel finder={wordsInRowFinder} />
      <WordsToFindPanel finder={wordsInRowFinder} />
    </>
  );
});
