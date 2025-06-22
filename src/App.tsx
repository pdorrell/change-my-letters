import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
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
      {appState.menuPages.map(({ page, config, isActive }) => (
        <button
          key={page}
          className={clsx('page-tab', { active: isActive })}
          onClick={isActive ? undefined : () => appState.navigateTo(page)}
          title={config.tooltip}
          disabled={isActive}
        >
          {config.label}
        </button>
      ))}
    </div>
  );
});

interface ResetButtonProps { appState: AppState; }

const ResetButton: React.FC<ResetButtonProps> = observer(({ appState }) => {
  const resetAction = appState.resetAction;

  if (!resetAction) {
    return null;
  }

  return (
    <button
      className="reset-button"
      onClick={resetAction.enabled ? () => resetAction.doAction() : undefined}
      disabled={!resetAction.enabled}
      title={resetAction.tooltip}
    >
      Reset
    </button>
  );
});


interface AppHeaderProps { appState: AppState; }

const AppHeader: React.FC<AppHeaderProps> = observer(({ appState }) => {
  return (
    <header>
      <h1>Change My Letters</h1>
      <PageNavigation appState={appState} />
      <ResetButton appState={appState} />
      <AppVersion version={appState.version} />
    </header>
  );
});

interface AppBodyProps { appState: AppState; }

const AppBody: React.FC<AppBodyProps> = observer(({ appState }) => {
  return (
    <main>
      {appState.currentPage === 'word' ? (
        <WordChangerPage wordChanger={appState.wordChanger} maxWordLength={appState.wordGraph.maxWordLength} />
      ) : appState.currentPage === 'make' ? (
        <MakePage
          makeInteraction={appState.makeInteraction}
          maxWordLength={appState.wordGraph.maxWordLength}
        />
      ) : appState.currentPage === 'reviewPronunciation' ? (
        <ReviewPronunciationPage appState={appState} />
      ) : appState.currentPage === 'finders' ? (
        <FindersPage appState={appState} />
      ) : appState.currentPage.startsWith('reset') ? (
        <ResetPage appState={appState} />
      ) : (
        <WordChangerPage wordChanger={appState.wordChanger} maxWordLength={appState.wordGraph.maxWordLength} />
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
