import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppState } from '@/models/app-state';
import { FinderTypeNavigation } from './finder-type-navigation';
import { WordChoiceFinderPage } from './word-choice-finder/word-choice-finder-page';
import { WordsInRowFinderPage } from './words-in-row-finder/words-in-row-finder-page';
import { Inspectable } from '@/lib/inspector';

interface FindersPageProps { appState: AppState; }

export const FindersPage: React.FC<FindersPageProps> = observer(({ appState }) => {
  return (
    <Inspectable label="FindersPage">
      <>
        <div className="finders-header">
          <FinderTypeNavigation finders={appState.finders} />
        </div>
        {appState.finders.currentFinderType === 'word-choice' && (
          <WordChoiceFinderPage wordChoiceFinder={appState.wordChoiceFinder} />
        )}
        {appState.finders.currentFinderType === 'words-in-row' && (
          <WordsInRowFinderPage wordsInRowFinder={appState.wordsInRowFinder} />
        )}
      </>
    </Inspectable>
  );
});
