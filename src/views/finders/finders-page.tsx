import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppState } from '@/models/app-state';
import { WordChoiceFinderPage } from './word-choice-finder/word-choice-finder-page';

interface FindersPageProps { appState: AppState; }

export const FindersPage: React.FC<FindersPageProps> = observer(({ appState }) => {
  return (
    <>
      {appState.findersInteraction.currentFinderType === 'word-choice' && (
        <WordChoiceFinderPage wordChoiceFinderInteraction={appState.wordChoiceFinderInteraction} />
      )}
    </>
  );
});
