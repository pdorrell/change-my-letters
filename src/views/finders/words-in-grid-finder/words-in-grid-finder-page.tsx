import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordsInGridFinder } from '@/models/finders/words-in-grid-finder/words-in-grid-finder';
import { FinderControls } from './finder-controls';
import { LettersGridPanel } from './letters-grid-panel';
import { WordsToFindPanel } from './words-to-find-panel';
import { Inspectable } from '@/lib/inspector';

interface WordsInGridFinderPageProps {
  finder: WordsInGridFinder;
}

export const WordsInGridFinderPage: React.FC<WordsInGridFinderPageProps> = observer(({ finder }) => {
  // Show error state if finder failed to initialize
  if (!finder.wordsToFind || !finder.lettersGrid) {
    return (
      <Inspectable name="WordsInGridFinderPage">
        <div className="words-in-grid-finder-page">
          <FinderControls finder={finder} />

          <div className="instructions-panel">
            <p style={{ color: '#dc3545' }}>
              Unable to create Words in Grid finder: not enough words available.
              Please try using a larger word list.
            </p>
          </div>
        </div>
      </Inspectable>
    );
  }

  return (
    <Inspectable name="WordsInGridFinderPage">
      <div className="words-in-grid-finder-page">
        <FinderControls finder={finder} />

        <div className="instructions-panel">
          <p>Click/touch any button below to hear a word, then find the word in the grid.</p>
        </div>

        <LettersGridPanel finder={finder} />

        <WordsToFindPanel finder={finder} />
      </div>
    </Inspectable>
  );
});
