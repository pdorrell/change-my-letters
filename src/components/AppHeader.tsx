import React from 'react';
import { AppVersion } from './AppVersion';
import { PageNavigation } from './PageNavigation';
import { AppState } from '../models/AppState';

interface AppHeaderProps { appState: AppState; }

export const AppHeader: React.FC<AppHeaderProps> = ({ appState }) => {
  return (
    <header>
      <AppVersion version={appState.version} />
      <div className="header-with-navigation">
        <h1>Change My Letters</h1>
        <PageNavigation appState={appState} />
      </div>
    </header>
  );
};