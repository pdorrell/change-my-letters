import React, { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ResetInteraction } from '../models/ResetInteraction';

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

  const handleRandomClick = () => {
    resetInteraction.chooseRandom();
  };

  const handleCancelClick = () => {
    // Navigate back to word view without changing the word
    resetInteraction.appState.navigateTo('wordView');
  };

  const handleWordClick = (word: string) => {
    resetInteraction.setNewWord(word);
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
          <button
            onClick={handleRandomClick}
            disabled={resetInteraction.appState.wordGraph.sortedWords.length === 0}
            title="Choose a random word from the full list (ignores filter)"
          >
            Choose Random
          </button>
          <button
            onClick={handleCancelClick}
            title="Return to the current word without changing"
          >
            Cancel
          </button>
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
