import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppState } from '@/models/app-state';
import { WordChangerPage } from '@/views/word-changer';
import { ReviewPronunciationPage } from '@/views/review/review-pronunciation';
import { ResetPage } from '@/views/reset/reset';
import { FindersPage } from '@/views/finders/finders-page';
import { MakePage } from '@/views/make/make-page';

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
      <h1>Change My Letters</h1>
      <PageNavigation appState={appState} />
      <AppVersion version={appState.version} />
    </header>
  );
});

interface AppBodyProps { appState: AppState; }

const AppBody: React.FC<AppBodyProps> = observer(({ appState }) => {
  return (
    <main>
      {appState.currentPage === 'wordView' ? (
        <WordChangerPage appState={appState} />
      ) : appState.currentPage === 'makeView' ? (
        <MakePage
          makeInteraction={appState.makeInteraction}
          maxWordLength={appState.wordGraph.maxWordLength}
        />
      ) : appState.currentPage === 'reviewPronunciationView' ? (
        <ReviewPronunciationPage appState={appState} />
      ) : appState.currentPage === 'findersView' ? (
        <FindersPage appState={appState} />
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
