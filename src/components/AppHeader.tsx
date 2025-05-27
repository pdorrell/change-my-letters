import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppVersion } from './AppVersion';
import { PageNavigation } from './PageNavigation';
import { CurrentWordAppControls } from './CurrentWordAppControls';
import { ResetAppControls } from './ResetAppControls';
import { AppState } from '../models/AppState';

interface AppHeaderProps { appState: AppState; }

export const AppHeader: React.FC<AppHeaderProps> = observer(({ appState }) => {
  return (
    <header>
      <AppVersion version={appState.version} />
      <div className="header-with-navigation">
        <h1>Change My Letters</h1>
        <PageNavigation appState={appState} />
      </div>
      {appState.currentPage === 'wordView' ? (
        <CurrentWordAppControls appState={appState} />
      ) : appState.currentPage === 'reviewPronunciationView' ? (
        <div className="app-controls">
          {/* No specific controls for review pronunciation page */}
        </div>
      ) : (
        <ResetAppControls appState={appState} />
      )}
    </header>
  );
});