import React from 'react';
import { createRoot } from 'react-dom/client';
import { configure } from 'mobx';
import AppLoader from './app-loader';
import { ErrorBoundary } from './lib/error-handling/error-boundary';
import { ErrorHandler } from './lib/error-handling/error-handler';
import { ApplicationLoader } from './models/application-loader';
import { WordSayer } from './models/word-sayer';
import { DataFileFetcher } from './lib/data-fetching/data-file-fetcher';
import './styles/main.scss';


configure({
  enforceActions: "observed",
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: true,
  disableErrorBoundaries: true
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
// Create singleton instances for ApplicationLoader dependencies
const wordSayer = new WordSayer(1.0, '/assets/words/eleven_labs/words');
const dataFileFetcher = new DataFileFetcher();
const applicationLoader = new ApplicationLoader(wordSayer, dataFileFetcher);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppLoader applicationLoader={applicationLoader} />
    </ErrorBoundary>
  </React.StrictMode>
);
