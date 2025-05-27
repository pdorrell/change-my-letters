import React from 'react';
import { AppState } from '../models/AppState';
import { ActionButton } from '../lib/ui/ActionButton';

interface ResetAppControlsProps { appState: AppState; }

export const ResetAppControls: React.FC<ResetAppControlsProps> = ({ appState }) => {
  return (
    <div className="app-controls">
      <ActionButton action={appState.undoAction}>
        Undo
      </ActionButton>
      <ActionButton action={appState.redoAction}>
        Redo
      </ActionButton>
    </div>
  );
};