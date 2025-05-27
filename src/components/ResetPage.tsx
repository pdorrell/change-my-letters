import React from 'react';
import { AppState } from '../models/AppState';
import { ResetAppControls } from './ResetAppControls';
import { ResetView } from '../views/Reset';
import { CompactHistoryView } from '../views/History';

interface ResetPageProps { appState: AppState; }

export const ResetPage: React.FC<ResetPageProps> = ({ appState }) => {
  return (
    <>
      <ResetAppControls appState={appState} />
      <ResetView resetInteraction={appState.resetInteraction} />
      <CompactHistoryView history={appState.history} />
    </>
  );
};