import React from 'react';
import { observer } from 'mobx-react-lite';
import { Reset } from '@/models/reset/reset';
import { ActionButton } from '@/lib/views/action-button';
import { FilterControls } from '@/lib/views/filter-controls';
import { Inspectable } from '@/lib/inspector';
import { Page } from '@/lib/views/page';

/**
 * Controls component for Reset page
 */
interface ResetControlsProps { resetInteraction: Reset; }

export const ResetControls: React.FC<ResetControlsProps> = observer(({ resetInteraction }) => {
  return (
    <Inspectable name="ResetControls">
      <div className="reset-controls">
        <div className="reset-controls-left">
          <FilterControls filter={resetInteraction.filter} />
        </div>
        <div className="reset-controls-right">
          <ActionButton action={resetInteraction.randomAction}>Choose Random</ActionButton>
        </div>
      </div>
    </Inspectable>
  );
});

/**
 * Word choice component for Reset page
 */
interface ResetWordChoiceProps { resetInteraction: Reset; }

export const ResetWordChoice: React.FC<ResetWordChoiceProps> = observer(({ resetInteraction }) => {
  const handleWordClick = (word: string) => {
    // Get the Word object from the word graph
    const wordObj = resetInteraction.appState.wordGraph.getNode(word);
    if (wordObj) {
      resetInteraction.setNewWord(wordObj);
    }
  };

  // Get filtered words
  const filteredWords = resetInteraction.filteredWords;

  return (
    <Inspectable name="ResetWordChoice">
      <div className="reset-word-choice">
        {filteredWords.length > 0 ? (
          <p>
            {filteredWords.map((word, index) => (
              <React.Fragment key={word}>
                <span
                  className="reset-word-option"
                  onClick={() => handleWordClick(word)}
                  title={`Set word changer to '${word}'`}
                >
                  {word}
                </span>
                {index < filteredWords.length - 1 && ' '}
              </React.Fragment>
            ))}
          </p>
        ) : (
          <p className="reset-no-words">
            No words match the current filter.
          </p>
        )}
      </div>
    </Inspectable>
  );
});

/**
 * Full page component for Reset page
 */
interface ResetPageProps { resetInteraction: Reset; }

export const ResetPage: React.FC<ResetPageProps> = observer(({ resetInteraction }) => {
  const targetPageLabel = resetInteraction.targetPage === 'maker' ? 'Maker' : 'Changer';

  return (
    <Inspectable name="ResetPage">
      <Page>
        <div className="reset-page-header">
          <p>Reset <b>{targetPageLabel}</b> page by choosing a new initial word.</p>
        </div>
        <ResetControls resetInteraction={resetInteraction} />
        <ResetWordChoice resetInteraction={resetInteraction} />
      </Page>
    </Inspectable>
  );
});
