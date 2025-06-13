import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppState } from '@/models/app-state';
import { FinderTypeNavigation } from './finder-type-navigation';
import { WordChoiceFinderPage } from './word-choice-finder/word-choice-finder-page';

interface FindersPageProps { appState: AppState; }

export const FindersPage: React.FC<FindersPageProps> = observer(({ appState }) => {
  return (
    <>
      <div className="finders-header">
        <FinderTypeNavigation findersInteraction={appState.findersInteraction} />
      </div>
      {appState.findersInteraction.currentFinderType === 'word-choice' && (
        <WordChoiceFinderPage wordChoiceFinderInteraction={appState.wordChoiceFinderInteraction} />
      )}
    </>
  );
});
