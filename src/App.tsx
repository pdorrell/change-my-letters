import React from 'react';
import { observer } from 'mobx-react-lite';
import { CurrentWordView } from './views/CurrentWordView';
import { AppState } from './models/AppState';

// Main application state
const appState = new AppState();

const App: React.FC = observer(() => {
  return (
    <div className="app-container">
      <header>
        <h1>Change My Letters</h1>
      </header>
      <main>
        {appState.currentPage === 'wordView' ? (
          <CurrentWordView currentWord={appState.currentWord} />
        ) : (
          <div>History View (not yet implemented)</div>
        )}
      </main>
    </div>
  );
});

export default App;