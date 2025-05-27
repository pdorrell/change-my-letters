import React, { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ResetInteraction } from '../models/ResetInteraction';
import { ActionButton } from '../lib/ui/ActionButton';
import { AppState } from '../models/AppState';
import { CompactHistoryView } from './History';

interface ResetViewProps { resetInteraction: ResetInteraction; }

export const ResetView: React.FC<ResetViewProps> = observer(({ resetInteraction }) => {
  // Create a ref for the filter input to focus it on mount
  const filterInputRef = useRef<HTMLInputElement>(null);

  // Focus the filter input when the component mounts
  useEffect(() => {
    if (filterInputRef.current) {
      filterInputRef.current.focus();
    }
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetInteraction.setFilter(e.target.value);
  };

  const handleMatchStartOnlyChange = () => {
    resetInteraction.toggleMatchStartOnly();
  };

  // These handlers are now replaced by ButtonAction objects in resetInteraction

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
    <div className="reset-view">
      <div className="reset-controls">
        <div className="reset-controls-left">
          <input
            type="text"
            ref={filterInputRef}
            value={resetInteraction.filter}
            onChange={handleFilterChange}
            placeholder="Filter words..."
            className="reset-filter-input"
          />
          <label className="reset-match-start-only">
            <input
              type="checkbox"
              checked={resetInteraction.matchStartOnly}
              onChange={handleMatchStartOnlyChange}
            />
            Match start only
          </label>
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

      <div className="reset-word-list">
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
      
    </div>
  );
});

/**
 * App controls component for Reset page
 */
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

/**
 * Full page component for Reset page
 */
interface ResetPageProps { appState: AppState; }

export const ResetPage: React.FC<ResetPageProps> = ({ appState }) => {
  return (
    <>
      <ResetView resetInteraction={appState.resetInteraction} />
      <CompactHistoryView history={appState.history} />
    </>
  );
};
