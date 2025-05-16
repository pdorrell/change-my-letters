import React from 'react';
import { createRoot } from 'react-dom/client';
import { configure } from 'mobx';
import AppLoader from './AppLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorHandler } from './utils/ErrorHandler';
import './styles/main.scss';

// Configure MobX with less strict settings for development
configure({
  enforceActions: 'observed',
  computedRequiresReaction: false,
  reactionRequiresObservable: false,
  observableRequiresReaction: false
});

// Initialize global error handling
ErrorHandler.initialize();

// Add some CSS for error display
const style = document.createElement('style');
style.textContent = `
  .error-boundary {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    box-sizing: border-box;
    background-color: #f8d7da;
  }
  .error-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #f5c6cb;
  }
  .error-container h2 {
    color: #721c24;
    margin-top: 0;
  }
  .error-message {
    padding: 15px;
    background-color: #f8d7da;
    border-radius: 4px;
    margin-bottom: 15px;
    font-family: monospace;
    white-space: pre-wrap;
    overflow-x: auto;
  }
  .error-details details {
    margin-bottom: 15px;
  }
  .error-details summary {
    cursor: pointer;
    padding: 8px;
    background-color: #f1f1f1;
    border-radius: 4px;
  }
  .error-details pre {
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 4px;
    overflow-x: auto;
    margin-top: 10px;
  }
  .error-actions button {
    background-color: #0066cc;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
  }
  .error-actions button:hover {
    background-color: #0055aa;
  }
`;
document.head.appendChild(style);

const container = document.getElementById('root');
if (!container) {
  throw new Error("Root element not found");
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppLoader />
    </ErrorBoundary>
  </React.StrictMode>
);