import React from 'react';
import { AppState } from '../models/AppState';
import { CurrentWordView } from '../views/CurrentWord';
import { CompactHistoryView } from '../views/History';

interface CurrentWordPageProps { appState: AppState; }

export const CurrentWordPage: React.FC<CurrentWordPageProps> = ({ appState }) => {
  return (
    <>
      <CurrentWordView currentWord={appState.currentWord} maxWordLength={appState.wordGraph.maxWordLength} />
      <CompactHistoryView history={appState.history} />
    </>
  );
};