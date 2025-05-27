import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppState } from '../models/AppState';
import { CurrentWordPage } from './CurrentWordPage';
import { ReviewPronunciationPage } from './ReviewPronunciationPage';
import { ResetPage } from './ResetPage';

interface AppBodyProps { appState: AppState; }

export const AppBody: React.FC<AppBodyProps> = observer(({ appState }) => {
  return (
    <main>
      {appState.currentPage === 'wordView' ? (
        <CurrentWordPage appState={appState} />
      ) : appState.currentPage === 'reviewPronunciationView' ? (
        <ReviewPronunciationPage appState={appState} />
      ) : (
        <ResetPage appState={appState} />
      )}
    </main>
  );
});