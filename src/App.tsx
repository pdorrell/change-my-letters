import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { AppState } from '@/models/app-state';
import { WordChangerPage } from '@/views/changer/word-changer';
import { PronunciationPage } from '@/views/pronunciation/pronunciation';
import { ResetPage } from '@/views/reset/reset';
import { FindersPage } from '@/views/finders/finders-page';
import { MakerPage } from '@/views/maker/maker-page';
import { InspectorToggle } from '@/lib/views/inspector-toggle';
import { HelpToggle } from '@/lib/views/help-toggle';
import { inspectorStore } from '@/lib/inspector-store';
import { Inspectable } from '@/lib/inspector';

interface AppProps {
  appState: AppState;
}

interface AppVersionProps { version: string; }

const AppVersion: React.FC<AppVersionProps> = observer(({ version }) => {
  return (
    <div title="Application version" className="version-display">
      V:<b>{version}</b>
    </div>
  );
});

interface PageNavigationProps { appState: AppState; }

const PageNavigation: React.FC<PageNavigationProps> = observer(({ appState }) => {
  return (
    <Inspectable name="PageNavigation">
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
    </Inspectable>
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
    <Inspectable name="AppHeader">
      <header>
        <h1>Change My Letters</h1>
        <PageNavigation appState={appState} />
        <ResetButton appState={appState} />
        <AppVersion version={appState.version} />
        <InspectorToggle />
        <HelpToggle />
      </header>
    </Inspectable>
  );
});

interface AppBodyProps { appState: AppState; }

const AppBody: React.FC<AppBodyProps> = observer(({ appState }) => {
  return (
    <main>
      {appState.currentPage === 'changer' ? (
        <WordChangerPage wordChanger={appState.wordChanger} maxWordLength={appState.wordGraph.maxWordLength} />
      ) : appState.currentPage === 'maker' ? (
        <MakerPage
          maker={appState.maker}
          maxWordLength={appState.wordGraph.maxWordLength}
        />
      ) : appState.currentPage === 'reviewPronunciation' ? (
        <PronunciationPage appState={appState} />
      ) : appState.currentPage === 'finders' ? (
        <FindersPage appState={appState} />
      ) : appState.currentPage.startsWith('reset') ? (
        <ResetPage resetInteraction={appState.resetPage} />
      ) : (
        <WordChangerPage wordChanger={appState.wordChanger} maxWordLength={appState.wordGraph.maxWordLength} />
      )}
    </main>
  );
});

const App: React.FC<AppProps> = observer(({ appState }) => {
  return (
    <div className={clsx('app-container', { inspector: inspectorStore.inspectorEnabled })}>
      <AppHeader appState={appState} />
      <AppBody appState={appState} />
    </div>
  );
});

export default App;
