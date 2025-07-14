import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordsInGridFinder } from '@/models/finders/words-in-grid-finder/words-in-grid-finder';
import { FinderControls } from './finder-controls';
import { LettersGridPanel } from './letters-grid-panel';
import { WordsToFindPanel } from './words-to-find-panel';
import { Inspectable } from '@/lib/inspector';

interface WordsInGridFinderPageProps {
  finder: WordsInGridFinder;
}

export const WordsInGridFinderPage: React.FC<WordsInGridFinderPageProps> = observer(({ finder }) => {
  return (
    <Inspectable name="WordsInGridFinderPage">
      <div className="words-in-grid-finder-page">
        <FinderControls finder={finder} />
        <LettersGridPanel finder={finder} />
        <WordsToFindPanel finder={finder} />
      </div>
    </Inspectable>
  );
});
