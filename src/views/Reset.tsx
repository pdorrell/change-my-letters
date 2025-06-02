import React from 'react';
import { observer } from 'mobx-react-lite';
import { ResetInteraction } from '../models/reset-interaction';
import { ActionButton } from '../lib/views/action-button';
import { AppState } from '../models/app-state';
import { HistoryPanel } from './history';
import { FilterControls } from '../lib/views/filter-controls';

/**
 * Controls component for Reset page
 */
interface ResetControlsProps { resetInteraction: ResetInteraction; }

export const ResetControls: React.FC<ResetControlsProps> = observer(({ resetInteraction }) => {
  return (
    <div className="reset-controls">
      <div className="reset-controls-left">
        <FilterControls filter={resetInteraction.filter} />
      </div>
      <div className="reset-controls-right">
        <ActionButton
          action={resetInteraction.randomAction}
        >
          Choose Random
        </ActionButton>
        <ActionButton
          action={resetInteraction.cancelAction}
        >
          Cancel
        </ActionButton>
      </div>
    </div>
  );
});

/**
 * Word choice component for Reset page
 */
interface ResetWordChoiceProps { resetInteraction: ResetInteraction; }

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
    <div className="reset-word-choice">
      {filteredWords.length > 0 ? (
        <p>
          {filteredWords.map((word, index) => (
            <React.Fragment key={word}>
              <span
                className="reset-word-option"
                onClick={() => handleWordClick(word)}
                title={`Set current word to '${word}'`}
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
  );
});

/**
 * Full page component for Reset page
 */
interface ResetPageProps { appState: AppState; }

export const ResetPage: React.FC<ResetPageProps> = observer(({ appState }) => {
  return (
    <>
      <ResetControls resetInteraction={appState.resetInteraction} />
      <ResetWordChoice resetInteraction={appState.resetInteraction} />
      <HistoryPanel history={appState.history} />
    </>
  );
});
