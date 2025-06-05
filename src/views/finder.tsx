import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppState } from '../models/app-state';
import { FinderMessagePanel } from './finder-message-panel';
import { WordToChoosePanel } from './word-to-choose-panel';
import { WordToFindPanel } from './word-to-find-panel';
import { FinderControls } from './finder-controls';

interface FinderPageProps { appState: AppState; }

export const FinderPage: React.FC<FinderPageProps> = observer(({ appState }) => {
  return (
    <>
      <FinderMessagePanel finderInteraction={appState.finderInteraction} />
      <WordToChoosePanel finderInteraction={appState.finderInteraction} />
      <WordToFindPanel finderInteraction={appState.finderInteraction} />
      <FinderControls finderInteraction={appState.finderInteraction} />
    </>
  );
});
