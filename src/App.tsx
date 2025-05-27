import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppHeader } from './components/AppHeader';
import { AppBody } from './components/AppBody';
import { AppState } from './models/AppState';

interface AppProps {
  appState: AppState;
}

const App: React.FC<AppProps> = observer(({ appState }) => {
  return (
    <div className="app-container">
      <AppHeader appState={appState} />
      <AppBody appState={appState} />
    </div>
  );
});

export default App;