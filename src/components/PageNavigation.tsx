import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppState } from '../models/AppState';

interface PageNavigationProps { appState: AppState; }

export const PageNavigation: React.FC<PageNavigationProps> = observer(({ appState }) => {
  return (
    <div className="page-navigation-tabs">
      {appState.allPages.map(({ page, label, tooltip, isActive }) => (
        <button
          key={page}
          className={`page-tab ${isActive ? 'active' : ''}`}
          onClick={isActive ? undefined : () => appState.navigateTo(page)}
          title={tooltip}
          disabled={isActive}
        >
          {label}
        </button>
      ))}
    </div>
  );
});