import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppState } from './models/app-state';
import { CurrentWordPage } from './views/current-word';
import { ReviewPronunciationPage } from './views/review/review-pronunciation';
import { ResetPage } from './views/reset/reset';
import { FinderPage } from './views/finder/finder';

interface AppProps {
  appState: AppState;
}

interface AppVersionProps { version: string; }

const AppVersion: React.FC<AppVersionProps> = observer(({ version }) => {
  return (
    <div className="version-display">
      Version: <b>{version}</b>
    </div>
  );
});

interface PageNavigationProps { appState: AppState; }

const PageNavigation: React.FC<PageNavigationProps> = observer(({ appState }) => {
  return (
    <div className="page-navigation-tabs">
      {appState.allPages.map(({ page, label, tooltip, isActive }) => (
        <button
          key={page}
          className={`page-tab ${isActive ? 'active' : ''}`}
          onClick={isActive ? undefined : () => appState.navigateTo(page)}
          title={tooltip}
          disabled={isActive}
        >
          {label}
        </button>
      ))}
    </div>
  );
});


interface AppHeaderProps { appState: AppState; }

const AppHeader: React.FC<AppHeaderProps> = observer(({ appState }) => {
  return (
    <header>
      <AppVersion version={appState.version} />
      <div className="header-with-navigation">
        <h1>Change My Letters</h1>
        <PageNavigation appState={appState} />
      </div>
    </header>
  );
});

interface AppBodyProps { appState: AppState; }

const AppBody: React.FC<AppBodyProps> = observer(({ appState }) => {
  return (
    <main>
      {appState.currentPage === 'wordView' ? (
        <CurrentWordPage appState={appState} />
      ) : appState.currentPage === 'reviewPronunciationView' ? (
        <ReviewPronunciationPage appState={appState} />
      ) : appState.currentPage === 'finderView' ? (
        <FinderPage appState={appState} />
      ) : (
        <ResetPage appState={appState} />
      )}
    </main>
  );
});

const App: React.FC<AppProps> = observer(({ appState }) => {
  return (
    <div className="app-container">
      <AppHeader appState={appState} />
      <AppBody appState={appState} />
    </div>
  );
});

export default App;
