import React from 'react';
import { AppState } from '../models/AppState';
import { ActionButton } from '../lib/ui/ActionButton';

interface CurrentWordAppControlsProps { appState: AppState; }

export const CurrentWordAppControls: React.FC<CurrentWordAppControlsProps> = ({ appState }) => {
  return (
    <div className="app-controls">
      <ActionButton action={appState.undoAction}>
        Undo
      </ActionButton>
      <ActionButton action={appState.redoAction}>
        Redo
      </ActionButton>
      <ActionButton action={appState.sayAction}>
        Say
      </ActionButton>
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
    </div>
  );
};