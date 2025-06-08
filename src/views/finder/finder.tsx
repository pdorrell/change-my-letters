import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppState } from '@/models/app-state';
import { FinderMessagePanel } from '@/views/finder/finder-message-panel';
import { WordToChoosePanel } from '@/views/finder/word-to-choose-panel';
import { WordToFindPanel } from '@/views/finder/word-to-find-panel';
import { FinderControls } from '@/views/finder/finder-controls';
import { ConfirmationView } from '@/lib/views/confirmation-view';

interface FinderPageProps { appState: AppState; }

export const FinderPage: React.FC<FinderPageProps> = observer(({ appState }) => {
  return (
    <>
      <WordToChoosePanel finderInteraction={appState.finderInteraction} />
      <WordToFindPanel finderInteraction={appState.finderInteraction} />
      <FinderMessagePanel finderInteraction={appState.finderInteraction} />
      <FinderControls finderInteraction={appState.finderInteraction} />
      <ConfirmationView
        confirmationModel={appState.finderInteraction.confirmation}
      />
    </>
  );
});
