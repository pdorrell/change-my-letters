import React from 'react';
import { observer } from 'mobx-react-lite';
import { CurrentWordView } from './views/CurrentWordView';
import { HistoryView } from './views/HistoryView';
import { ResetView } from './views/ResetView';
import { AppState } from './models/AppState';

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
        <h1>Change My Letters</h1>
        <div className="app-controls">
          <button
            onClick={() => appState.resetGame()}
            title="Choose a new word"
          >
            Reset...
          </button>
          <button
            onClick={() => appState.undo()}
            disabled={!appState.history.canUndo}
            title="Undo last change"
          >
            Undo
          </button>
          <button
            onClick={() => appState.redo()}
            disabled={!appState.history.canRedo}
            title="Redo last undone change"
          >
            Redo
          </button>
          <button
            onClick={() => appState.navigateTo(appState.currentPage === 'wordView' ? 'historyView' : 'wordView')}
            title={appState.currentPage === 'wordView' ? 'View history' : 'Back to word'}
          >
            {appState.currentPage === 'wordView' ? '→ History' : '→ Current Word'}
          </button>
          
          {appState.currentPage === 'wordView' && (
            <>
              <button
                onClick={() => appState.currentWord.say()}
                title="Say the current word"
              >
                Say
              </button>
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
          <CurrentWordView currentWord={appState.currentWord} />
        ) : appState.currentPage === 'historyView' ? (
          <HistoryView history={appState.history} />
        ) : (
          <ResetView resetInteraction={appState.resetInteraction} />
        )}
      </main>
    </div>
  );
});

export default App;