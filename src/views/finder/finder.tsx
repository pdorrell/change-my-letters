import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppState } from '@/models/app-state';
import { FinderMessagePanel } from '@/views/finder/finder-message-panel';
import { WordToChoosePanel } from '@/views/finder/word-to-choose-panel';
import { WordToFindPanel } from '@/views/finder/word-to-find-panel';
import { FinderControls } from '@/views/finder/finder-controls';
import { ConfirmationDialog } from '@/lib/views/confirmation-dialog';

interface FinderPageProps { appState: AppState; }

export const FinderPage: React.FC<FinderPageProps> = observer(({ appState }) => {
  return (
    <>
      <WordToChoosePanel finderInteraction={appState.finderInteraction} />
      <WordToFindPanel finderInteraction={appState.finderInteraction} />
      <FinderMessagePanel finderInteraction={appState.finderInteraction} />
      <FinderControls finderInteraction={appState.finderInteraction} />
      <ConfirmationDialog
        confirming={appState.finderInteraction.confirmingNew}
        question="Are you sure you want to quit and start again with new words to find?"
        operation={() => appState.finderInteraction.new()}
      />
    </>
  );
});
