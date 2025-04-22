import React from 'react';
import { createRoot } from 'react-dom/client';
import { configure } from 'mobx';
import App from './App';
import './styles/main.scss';

// Configure MobX with less strict settings for development
configure({
  enforceActions: 'observed',
  computedRequiresReaction: false,
  reactionRequiresObservable: false,
  observableRequiresReaction: false
});

const container = document.getElementById('root');
if (!container) {
  throw new Error("Root element not found");
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);