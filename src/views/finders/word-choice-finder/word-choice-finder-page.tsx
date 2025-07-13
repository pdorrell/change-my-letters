import React from 'react';
import { observer } from 'mobx-react-lite';
import { Inspectable } from '@/lib/inspector';
import { Page } from '@/lib/views/page';
import { WordChoiceFinder } from '@/models/finders/word-choice-finder/word-choice-finder';
import { WordToChoosePanel } from './word-to-choose-panel';
import { WordToFindPanel } from './word-to-find-panel';
import { FinderScoreAndControls } from './finder-score-and-controls';
import { ConfirmationView } from '@/lib/views/confirmation-view';

interface WordChoiceFinderPageProps { wordChoiceFinder: WordChoiceFinder; }

export const WordChoiceFinderPage: React.FC<WordChoiceFinderPageProps> = observer(({ wordChoiceFinder }) => {
  return (
    <Inspectable name="WordChoiceFinderPage">
      <Page>
        <>
          <WordToChoosePanel finder={wordChoiceFinder} />
          <WordToFindPanel finder={wordChoiceFinder} />
          <FinderScoreAndControls finder={wordChoiceFinder} />
          <ConfirmationView confirmationModel={wordChoiceFinder.confirmation}
          />
        </>
      </Page>
    </Inspectable>
  );
});
