import React from 'react';
import { observer } from 'mobx-react-lite';
import { Inspectable } from '@/lib/inspector';
import { Page } from '@/lib/views/page';
import { WordsInRowFinder } from '@/models/finders/words-in-row-finder/words-in-row-finder';
import { FinderControls } from './finder-controls';
import { WordsToFindPanel } from '@/views/finders/words-to-find-panel';
import { LettersRowPanel } from './letters-row-panel';

interface WordsInRowFinderPageProps { wordsInRowFinder: WordsInRowFinder; }

export const WordsInRowFinderPage: React.FC<WordsInRowFinderPageProps> = observer(({ wordsInRowFinder }) => {
  return (
    <Inspectable name="WordsInRowFinderPage">
      <Page>
        <>
          <FinderControls finder={wordsInRowFinder} />
          <LettersRowPanel finder={wordsInRowFinder} />
          <WordsToFindPanel finder={wordsInRowFinder} />
        </>
      </Page>
    </Inspectable>
  );
});
