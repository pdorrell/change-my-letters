import React from 'react';
import { observer } from 'mobx-react-lite';
import { Inspectable } from '@/lib/inspector';
import { WordChoiceFinder } from '@/models/finders/word-choice-finder/word-choice-finder';
import { FinderMessagePanel } from './finder-message-panel';
import { WordToChoosePanel } from './word-to-choose-panel';
import { WordToFindPanel } from './word-to-find-panel';
import { FinderScoreAndControlsPanel } from './finder-score-and-controls-panel';
import { ConfirmationView } from '@/lib/views/confirmation-view';

interface WordChoiceFinderPageProps { wordChoiceFinder: WordChoiceFinder; }

export const WordChoiceFinderPage: React.FC<WordChoiceFinderPageProps> = observer(({ wordChoiceFinder }) => {
  return (
    <Inspectable label="WordChoiceFinderPage">
      <>
        <WordToChoosePanel finder={wordChoiceFinder} />
        <WordToFindPanel finder={wordChoiceFinder} />
        <FinderScoreAndControlsPanel finder={wordChoiceFinder} />
        <FinderMessagePanel finder={wordChoiceFinder} />
        <ConfirmationView confirmationModel={wordChoiceFinder.confirmation}
        />
      </>
    </Inspectable>
  );
});
