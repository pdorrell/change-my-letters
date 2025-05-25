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
        {appState.currentPage === 'reviewPronunciationView' ? (
          <h1>Change My Letters <span className="sub-header">Review Pronunciation</span></h1>
        ) : (
          <h1>Change My Letters</h1>
        )}
        <div className="app-controls">
          <ActionButton action={appState.resetAction}>
            Reset...
          </ActionButton>
          <ActionButton action={appState.undoAction}>
            Undo
          </ActionButton>
          <ActionButton action={appState.redoAction}>
            Redo
          </ActionButton>
          <ActionButton action={appState.toggleViewAction}>
            {appState.currentPage === 'wordView' ? '→ History' : '→ Current Word'}
          </ActionButton>
          
          {appState.currentPage === 'wordView' && (
            <ActionButton action={appState.reviewPronunciationAction}>
              → Review Pronunciation
            </ActionButton>
          )}
          
          {appState.currentPage === 'reviewPronunciationView' && (
            <ActionButton action={new ButtonAction(() => appState.navigateTo('wordView'), { tooltip: "Back to current word" })}>
              → Current Word
            </ActionButton>
          )}
          
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