import React from 'react';
import { createRoot } from 'react-dom/client';
import { configure } from 'mobx';
import App from './App';
import './styles/main.scss';

// Configure MobX
configure({
  enforceActions: 'always',
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: true
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);