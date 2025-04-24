import React from 'react';
import { observer } from 'mobx-react-lite';
import { CurrentWordView } from './views/CurrentWordView';
import { AppState } from './models/AppState';

// Main application state
const appState = new AppState();

// Export for use in child components
export const getAppState = () => appState;

const App: React.FC = observer(() => {
  return (
    <div className="app-container">
      <header>
        <h1>Change My Letters</h1>
        <div className="app-controls">
          <button 
            onClick={() => appState.resetGame()}
            title="Start a new game"
          >
            Start Over
          </button>
          <button 
            onClick={() => appState.undo()}
            disabled={!appState.history.canUndo}
            className={!appState.history.canUndo ? 'hidden' : ''}
            title="Undo last change"
          >
            Undo
          </button>
          <button 
            onClick={() => appState.redo()}
            disabled={!appState.history.canRedo}
            className={!appState.history.canRedo ? 'hidden' : ''}
            title="Redo last undone change"
          >
            Redo
          </button>
          <button 
            onClick={() => appState.navigateTo(appState.currentPage === 'wordView' ? 'historyView' : 'wordView')}
            title={appState.currentPage === 'wordView' ? 'View history' : 'Back to word'}
          >
            {appState.currentPage === 'wordView' ? 'See History' : 'Back to Word'}
          </button>
        </div>
      </header>
      <main>
        {appState.isLoading ? (
          <div className="loading">Loading word data...</div>
        ) : appState.currentPage === 'wordView' ? (
          <CurrentWordView currentWord={appState.currentWord} />
        ) : (
          <div className="history-view">
            <h2>Word History</h2>
            <div className="history-list">
              {appState.history.entries.map((entry, index) => (
                <div 
                  key={`history-${index}`}
                  className={`history-item ${index === appState.history.currentIndex ? 'current' : ''}`}
                  onClick={() => {
                    const word = appState.history.jumpToIndex(index);
                    if (word) {
                      appState.setNewWord(word);
                      appState.navigateTo('wordView');
                    }
                  }}
                >
                  <div className="history-word">{entry.word}</div>
                  {entry.change && (
                    <div className="history-change">
                      {entry.change.type === 'delete_letter' && `Deleted letter at position ${entry.change.position}`}
                      {entry.change.type === 'insert_letter' && `Inserted ${entry.change.letter} at position ${entry.change.position}`}
                      {entry.change.type === 'replace_letter' && `Replaced letter at position ${entry.change.position} with ${entry.change.letter}`}
                      {entry.change.type === 'upper_case_letter' && `Uppercased letter at position ${entry.change.position}`}
                      {entry.change.type === 'lower_case_letter' && `Lowercased letter at position ${entry.change.position}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
});

export default App;