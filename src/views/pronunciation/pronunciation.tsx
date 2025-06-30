import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { PronunciationInteraction } from '@/models/pronunciation/pronunciation';
import { ActionButton } from '@/lib/views/action-button';
import { AppState } from '@/models/app-state';

/**
 * Action controls component for Pronunciation page
 */
interface ActionControlsProps {
  pronunciationInteraction: PronunciationInteraction;
  reviewStateFileLoader: (file: File) => void;
}

export const ReviewStateControls: React.FC<ActionControlsProps> = observer(({ pronunciationInteraction, reviewStateFileLoader }) => {

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const file = files.find(f => f.name === 'review-pronunciation-state.json');

    if (file) {
      reviewStateFileLoader(file);
    } else {
      alert('Please drop a file named "review-pronunciation-state.json"');
    }
  };

  return (
    <div className="action-buttons-panel">
      <div
        className="load-state-button-container"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <ActionButton action={pronunciationInteraction.loadStateAction}>
          + Load State
        </ActionButton>
      </div>

      <ActionButton action={pronunciationInteraction.saveStateAction}>
        Save State
      </ActionButton>

      <ActionButton action={pronunciationInteraction.downloadWrongWordsAction}>
        Download Wrong Words
      </ActionButton>

      <ActionButton action={pronunciationInteraction.resetAllToUnreviewedAction}>
        Reset All to Unreviewed
      </ActionButton>

      <ActionButton action={pronunciationInteraction.resetAllToOKAction}>
        Reset All to OK
      </ActionButton>

      <ActionButton action={pronunciationInteraction.reviewWrongWordsAction}>
        Review Wrong Words
      </ActionButton>
    </div>
  );
});

/**
 * State controls component for Pronunciation page
 */
interface StateControlsProps {
  pronunciationInteraction: PronunciationInteraction;
}

export const StateControls: React.FC<StateControlsProps> = observer(({ pronunciationInteraction }) => {
  return (
    <div className="word-changer-panel">
      <div className="current-review-word">
        <span
          className={clsx('word-span', {
            'no-word': !pronunciationInteraction.currentWord,
            'wrong current-review': pronunciationInteraction.currentWord?.soundsWrong,
            'ok current-review': pronunciationInteraction.currentWord && !pronunciationInteraction.currentWord.soundsWrong
          })}
        >
          {pronunciationInteraction.currentWord ? pronunciationInteraction.currentWord.word : '\u00A0'}
        </span>

        {pronunciationInteraction.reviewMode && (
          <div className="review-buttons">
            <ActionButton action={pronunciationInteraction.markSoundsWrongAction}>
              Sounds Wrong
            </ActionButton>

            <ActionButton action={pronunciationInteraction.markOKAction}>
              Sounds OK
            </ActionButton>
          </div>
        )}

        <div className="autoplay-controls">
          <ActionButton action={pronunciationInteraction.autoplayAction}>
            {pronunciationInteraction.autoplaying ? 'Stop' : 'Auto'}
          </ActionButton>

          <select
            value={pronunciationInteraction.autoPlayWaitMillis}
            onChange={(e) => {
              pronunciationInteraction.stopAutoplay();
              pronunciationInteraction.setAutoPlayWaitMillis(parseInt(e.target.value));
            }}
            className="autoplay-interval-select"
          >
            <option value={100}>100ms</option>
            <option value={200}>200ms</option>
            <option value={300}>300ms</option>
            <option value={400}>400ms</option>
            <option value={500}>500ms</option>
          </select>
        </div>
      </div>
    </div>
  );
});

/**
 * Filters component for Pronunciation page
 */
interface PronunciationFiltersProps {
  pronunciationInteraction: PronunciationInteraction;
}

export const PronunciationFilters: React.FC<PronunciationFiltersProps> = observer(({ pronunciationInteraction }) => {
  return (
    <div className="pronunciation-filters">
      <div className="filter-panel">
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Filter..."
            value={pronunciationInteraction.filter.value.value}
            onChange={(e) => pronunciationInteraction.setFilterValue(e.target.value)}
          />
          <div className="radio-group">
            <span>Match</span>
            {['start', 'end', 'any'].map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name="match-option"
                  value={option}
                  checked={pronunciationInteraction.filter.matchOption.value === option}
                  onChange={(e) => pronunciationInteraction.setFilterMatchOption(e.target.value as 'start' | 'end' | 'any')}
                />
                {option}
              </label>
            ))}
          </div>

          {pronunciationInteraction.reviewMode && (
            <div className="review-state-filter">
              <label htmlFor="review-state-select">Review state:</label>
              <select
                id="review-state-select"
                value={pronunciationInteraction.reviewStateFilterOptions.indexOf(pronunciationInteraction.reviewStateFilter)}
                onChange={(e) => {
                  const index = parseInt(e.target.value);
                  pronunciationInteraction.setReviewStateFilter(pronunciationInteraction.reviewStateFilterOptions[index]);
                }}
              >
                {pronunciationInteraction.reviewStateFilterOptions.map((option, index) => (
                  <option key={index} value={index}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!pronunciationInteraction.reviewMode && (
            <div className="auto-control">
              <button
                title={pronunciationInteraction.autoplayAction.tooltip}
                onClick={() => pronunciationInteraction.autoplayAction.doAction()}
              >
                Auto
              </button>
            </div>
          )}

          <div className="review-mode-filter">
            <label htmlFor="review-mode-checkbox">
              <input
                id="review-mode-checkbox"
                type="checkbox"
                checked={pronunciationInteraction.reviewMode}
                onChange={(e) => pronunciationInteraction.setReviewMode(e.target.checked)}
              />
              Review mode
            </label>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Word choice component for Pronunciation page
 */
interface PronunciationWordChoiceProps {
  pronunciationInteraction: PronunciationInteraction;
}

export const PronunciationWordChoice: React.FC<PronunciationWordChoiceProps> = observer(({ pronunciationInteraction }) => {
  const keyboardHint = pronunciationInteraction.reviewMode
    ? "Use ← → arrow keys to navigate, Alt+→ to start autoplay, space bar to toggle sounds wrong"
    : "Use ← → arrow keys to navigate, Alt+→ to start autoplay";

  return (
    <div className="pronunciation-word-choice">
      {/* Filtered Words */}
      <div className="filtered-words">
        <div className="words-header">
          <span className="words-count">Words: {pronunciationInteraction.filteredWords.length}</span>
          <div className="keyboard-shortcuts">
            {!pronunciationInteraction.reviewMode && (
              <ActionButton action={pronunciationInteraction.resetMaxWordsAction}>
                ↻...
              </ActionButton>
            )}
            <span className="shortcut-hint">{keyboardHint}</span>
          </div>
        </div>

        <div className={clsx('words-grid', 'touch-interactive-area', { 'activity-mode': !pronunciationInteraction.reviewMode })}>
          {pronunciationInteraction.displayedWords.map(word => {
            const isCurrentReview = word.currentReview;
            const isReviewed = word.reviewed && !word.soundsWrong;
            const isWrong = word.soundsWrong;

            const className = clsx('word-span', {
              // Review mode states
              'wrong': pronunciationInteraction.reviewMode && isWrong,
              'ok': pronunciationInteraction.reviewMode && isReviewed && !isWrong,
              'current-review': isCurrentReview
            });

            return (
              <span
                key={word.word}
                className={className}
                onClick={() => pronunciationInteraction.reviewWord(word.word)}
              >
                {word.word}
              </span>
            );
          })}

          {pronunciationInteraction.hasMoreWords && (
            <button
              className={clsx('word-span', 'ellipsis-button')}
              title={pronunciationInteraction.showMoreWordsAction.tooltip}
              onClick={() => pronunciationInteraction.showMoreWordsAction.doAction()}
            >
              ...
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

/**
 * Main view component for Pronunciation page
 */
interface PronunciationViewProps {
  pronunciationInteraction: PronunciationInteraction;
}

export const PronunciationView: React.FC<PronunciationViewProps> = observer(({ pronunciationInteraction }) => {
  // Add keyboard event listener for arrow key navigation and space bar toggle
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        if (pronunciationInteraction.autoplaying) {
          pronunciationInteraction.stopAutoplay();
        }
        pronunciationInteraction.gotoNextWord();
      } else if (e.key === 'ArrowRight' && !e.ctrlKey && e.altKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        if (!pronunciationInteraction.autoplaying) {
          pronunciationInteraction.startAutoplay();
        }
      } else if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        if (pronunciationInteraction.autoplaying) {
          pronunciationInteraction.stopAutoplay();
        }
        pronunciationInteraction.gotoPreviousWord();
      } else if (e.key === ' ' && pronunciationInteraction.currentWord && pronunciationInteraction.reviewMode) {
        e.preventDefault();
        if (pronunciationInteraction.autoplaying) {
          pronunciationInteraction.stopAutoplay();
        }
        if (pronunciationInteraction.currentWord.soundsWrong) {
          pronunciationInteraction.markOK(pronunciationInteraction.currentWord.word);
        } else {
          pronunciationInteraction.markSoundsWrong(pronunciationInteraction.currentWord.word);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (pronunciationInteraction.autoplaying) {
          pronunciationInteraction.stopAutoplay();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [pronunciationInteraction]);

  return (
    <div className={clsx('pronunciation-container', { 'activity-mode': !pronunciationInteraction.reviewMode })}>
      {pronunciationInteraction.reviewMode && (
        <ReviewStateControls
          pronunciationInteraction={pronunciationInteraction}
          reviewStateFileLoader={(file: File) => pronunciationInteraction.loadReviewStateFromFile(file)}
        />
      )}
      <PronunciationFilters pronunciationInteraction={pronunciationInteraction} />
      <StateControls pronunciationInteraction={pronunciationInteraction} />
      <PronunciationWordChoice pronunciationInteraction={pronunciationInteraction} />
    </div>
  );
});

/**
 * Full page component for Pronunciation page
 */
interface PronunciationPageProps { appState: AppState; }

export const PronunciationPage: React.FC<PronunciationPageProps> = observer(({ appState }) => {
  return (
    <PronunciationView pronunciationInteraction={appState.pronunciationInteraction} />
  );
});
