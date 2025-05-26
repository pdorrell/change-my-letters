import React from 'react';
import { observer } from 'mobx-react-lite';
import { CurrentWordView } from './views/CurrentWordView';
import { CompactHistoryView } from './views/HistoryView';
import { ResetView } from './views/ResetView';
import { ReviewPronunciationView } from './views/ReviewPronunciationView';
import { AppState } from './models/AppState';
import { ActionButton } from './lib/ui/ActionButton';

interface AppProps {
  appState: AppState;
}

const App: React.FC<AppProps> = observer(({ appState }) => {
  return (
    <div className="app-container">
      <header>
        <div className="version-display">
          Version: <b>{appState.version}</b>
        </div>
        <div className="header-with-navigation">
          <h1>Change My Letters</h1>
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
        </div>
        <div className="app-controls">
          <ActionButton action={appState.undoAction}>
            Undo
          </ActionButton>
          <ActionButton action={appState.redoAction}>
            Redo
          </ActionButton>
          
          {appState.currentPage === 'wordView' && (
            <>
              <ActionButton action={appState.sayAction}>
                Say
              </ActionButton>
              <label className="say-immediately-container">
                <input
                  type="checkbox"
                  checked={appState.sayImmediately}
                  onChange={(e) => {
                    appState.sayImmediately = e.target.checked;
                  }}
                />
                Say Immediately
              </label>
            </>
          )}
        </div>
      </header>
      <main>
        {appState.currentPage === 'wordView' ? (
          <>
            <CurrentWordView currentWord={appState.currentWord} maxWordLength={appState.wordGraph.maxWordLength} />
            <CompactHistoryView history={appState.history} />
          </>
        ) : appState.currentPage === 'reviewPronunciationView' ? (
          <ReviewPronunciationView reviewInteraction={appState.reviewPronunciationInteraction} />
        ) : (
          <>
            <ResetView resetInteraction={appState.resetInteraction} />
            <CompactHistoryView history={appState.history} />
          </>
        )}
      </main>
    </div>
  );
});

export default App;