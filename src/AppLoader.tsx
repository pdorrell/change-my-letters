import React from 'react';
import { observer } from 'mobx-react-lite';
import App from './App';
import { ApplicationLoader } from './models/ApplicationLoader';

interface AppLoaderProps {
  applicationLoader: ApplicationLoader;
}

/**
 * AppLoader is the top-level component that handles loading the application
 * state and displaying either a loading indicator or the main App component
 */
const AppLoader: React.FC<AppLoaderProps> = observer(({ applicationLoader }) => {
  // Show loading indicator while application data is loading
  if (applicationLoader.isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }
  
  // Show error if there was a problem loading the app
  if (applicationLoader.hasError) {
    return (
      <div className="error-container">
        <div className="error-text">
          Error loading application: {applicationLoader.errorMessage}
        </div>
        <button 
          onClick={() => applicationLoader.loadApplication()}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Show main app once loading is complete
  return (
    <App appState={applicationLoader.appState!} />
  );
});

export default AppLoader;