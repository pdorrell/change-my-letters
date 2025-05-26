import React from 'react';
import { observer } from 'mobx-react-lite';
import { CurrentWordView } from './views/CurrentWordView';
import { HistoryView } from './views/HistoryView';
import { ResetView } from './views/ResetView';
import { ReviewPronunciationView } from './views/ReviewPronunciationView';
import { AppState } from './models/AppState';
import { ActionButton } from './lib/ui/ActionButton';
import { ButtonAction } from './lib/ui/actions';

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
        {appState.subHeader ? (
          <h1>Change My Letters <span className="sub-header">{appState.subHeader}</span></h1>
        ) : (
          <h1>Change My Letters</h1>
        )}
        <div className="app-controls">
          <ActionButton action={new ButtonAction(
            appState.currentPage === 'resetView' ? null : () => appState.navigateTo('resetView'),
            { tooltip: "Choose a new word" }
          )}>
            Reset...
          </ActionButton>
          
          {appState.availablePages.length > 0 && (
            <div className="page-navigation">
              <span className="page-nav-arrow">→</span>
              <select 
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    appState.navigateTo(e.target.value as 'wordView' | 'historyView' | 'resetView' | 'reviewPronunciationView');
                    e.target.value = ""; // Reset to empty after navigation
                  }
                }}
                className="page-nav-select"
              >
                <option value="">page...</option>
                {appState.availablePages.map(({ page, label }) => (
                  <option key={page} value={page}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
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
          <CurrentWordView currentWord={appState.currentWord} maxWordLength={appState.wordGraph.maxWordLength} />
        ) : appState.currentPage === 'historyView' ? (
          <HistoryView history={appState.history} />
        ) : appState.currentPage === 'reviewPronunciationView' ? (
          <ReviewPronunciationView reviewInteraction={appState.reviewPronunciationInteraction} />
        ) : (
          <ResetView resetInteraction={appState.resetInteraction} />
        )}
      </main>
    </div>
  );
});

export default App;