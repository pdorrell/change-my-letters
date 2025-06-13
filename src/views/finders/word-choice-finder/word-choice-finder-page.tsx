import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordChoiceFinderInteraction } from '@/models/finders/word-choice-finder/word-choice-finder-interaction';
import { FinderMessagePanel } from './finder-message-panel';
import { WordToChoosePanel } from './word-to-choose-panel';
import { WordToFindPanel } from './word-to-find-panel';
import { FinderScoreAndControlsPanel } from './finder-score-and-controls-panel';
import { ConfirmationView } from '@/lib/views/confirmation-view';

interface WordChoiceFinderPageProps { wordChoiceFinderInteraction: WordChoiceFinderInteraction; }

export const WordChoiceFinderPage: React.FC<WordChoiceFinderPageProps> = observer(({ wordChoiceFinderInteraction }) => {
  return (
    <>
      <WordToChoosePanel finderInteraction={wordChoiceFinderInteraction} />
      <WordToFindPanel finderInteraction={wordChoiceFinderInteraction} />
      <FinderScoreAndControlsPanel finderInteraction={wordChoiceFinderInteraction} />
      <FinderMessagePanel finderInteraction={wordChoiceFinderInteraction} />
      <ConfirmationView
        confirmationModel={wordChoiceFinderInteraction.confirmation}
      />
    </>
  );
});
