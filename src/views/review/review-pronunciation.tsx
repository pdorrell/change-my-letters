import React from 'react';
import { observer } from 'mobx-react-lite';
import { ReviewPronunciationInteraction } from '@/models/review/review-pronunciation-interaction';
import { ActionButton } from '@/lib/views/action-button';
import { AppState } from '@/models/app-state';

/**
 * Action controls component for Review Pronunciation page
 */
interface ReviewActionControlsProps {
  reviewInteraction: ReviewPronunciationInteraction;
  reviewStateFileLoader: (file: File) => void;
}

export const ReviewActionControls: React.FC<ReviewActionControlsProps> = observer(({ reviewInteraction, reviewStateFileLoader }) => {

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
        <ActionButton action={reviewInteraction.loadStateAction}>
          + Load State
        </ActionButton>
      </div>

      <ActionButton action={reviewInteraction.saveStateAction}>
        Save State
      </ActionButton>

      <ActionButton action={reviewInteraction.downloadWrongWordsAction}>
        Download Wrong Words
      </ActionButton>

      <ActionButton action={reviewInteraction.resetAllToUnreviewedAction}>
        Reset All to Unreviewed
      </ActionButton>

      <ActionButton action={reviewInteraction.resetAllToOKAction}>
        Reset All to OK
      </ActionButton>

      <ActionButton action={reviewInteraction.reviewWrongWordsAction}>
        Review Wrong Words
      </ActionButton>
    </div>
  );
});

/**
 * State controls component for Review Pronunciation page
 */
interface ReviewStateControlsProps {
  reviewInteraction: ReviewPronunciationInteraction;
}

export const ReviewStateControls: React.FC<ReviewStateControlsProps> = observer(({ reviewInteraction }) => {
  return (
    <div className="word-changer-panel">
      <div className="current-review-word">
        <span
          className={`word-span ${
            reviewInteraction.currentReviewWord
              ? (reviewInteraction.currentReviewWord.soundsWrong ? 'wrong' : 'ok') + ' current-review'
              : 'no-word'
          }`}
        >
          {reviewInteraction.currentReviewWord ? reviewInteraction.currentReviewWord.word : '\u00A0'}
        </span>

        {reviewInteraction.reviewMode && (
          <div className="review-buttons">
            <ActionButton action={reviewInteraction.markSoundsWrongAction}>
              Sounds Wrong
            </ActionButton>

            <ActionButton action={reviewInteraction.markOKAction}>
              Sounds OK
            </ActionButton>
          </div>
        )}

        <div className="autoplay-controls">
          <ActionButton action={reviewInteraction.autoplayAction}>
            {reviewInteraction.autoplaying ? 'Stop' : 'Auto'}
          </ActionButton>

          <select
            value={reviewInteraction.autoPlayWaitMillis}
            onChange={(e) => {
              reviewInteraction.stopAutoplay();
              reviewInteraction.setAutoPlayWaitMillis(parseInt(e.target.value));
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
 * Filters component for Review Pronunciation page
 */
interface ReviewPronunciationFiltersProps {
  reviewInteraction: ReviewPronunciationInteraction;
}

export const ReviewPronunciationFilters: React.FC<ReviewPronunciationFiltersProps> = observer(({ reviewInteraction }) => {
  return (
    <div className="review-pronunciation-filters">
      <div className="filter-panel">
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Filter..."
            value={reviewInteraction.filter.value.value}
            onChange={(e) => reviewInteraction.setFilterValue(e.target.value)}
          />
          <div className="radio-group">
            <span>Match</span>
            {['start', 'end', 'any'].map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name="match-option"
                  value={option}
                  checked={reviewInteraction.filter.matchOption.value === option}
                  onChange={(e) => reviewInteraction.setFilterMatchOption(e.target.value as 'start' | 'end' | 'any')}
                />
                {option}
              </label>
            ))}
          </div>

          {reviewInteraction.reviewMode && (
            <div className="review-state-filter">
              <label htmlFor="review-state-select">Review state:</label>
              <select
                id="review-state-select"
                value={reviewInteraction.reviewStateFilterOptions.indexOf(reviewInteraction.reviewStateFilter)}
                onChange={(e) => {
                  const index = parseInt(e.target.value);
                  reviewInteraction.setReviewStateFilter(reviewInteraction.reviewStateFilterOptions[index]);
                }}
              >
                {reviewInteraction.reviewStateFilterOptions.map((option, index) => (
                  <option key={index} value={index}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!reviewInteraction.reviewMode && (
            <div className="auto-control">
              <button
                title={reviewInteraction.autoplayAction.tooltip}
                onClick={() => reviewInteraction.autoplayAction.doAction()}
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
                checked={reviewInteraction.reviewMode}
                onChange={(e) => reviewInteraction.setReviewMode(e.target.checked)}
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
 * Word choice component for Review Pronunciation page
 */
interface ReviewPronunciationWordChoiceProps {
  reviewInteraction: ReviewPronunciationInteraction;
}

export const ReviewPronunciationWordChoice: React.FC<ReviewPronunciationWordChoiceProps> = observer(({ reviewInteraction }) => {
  const keyboardHint = reviewInteraction.reviewMode
    ? "Use ← → arrow keys to navigate, Alt+→ to start autoplay, space bar to toggle sounds wrong"
    : "Use ← → arrow keys to navigate, Alt+→ to start autoplay";

  return (
    <div className="review-pronunciation-word-choice">
      {/* Filtered Words */}
      <div className="filtered-words">
        <div className="words-header">
          <span className="words-count">Words: {reviewInteraction.filteredWords.length}</span>
          <div className="keyboard-shortcuts">
            <span className="shortcut-hint">{keyboardHint}</span>
          </div>
        </div>

        <div className={`words-grid touch-interactive-area ${reviewInteraction.reviewMode ? '' : 'activity-mode'}`}>
          {reviewInteraction.displayedWords.map(word => {
            const isCurrentReview = word.currentReview;
            const isReviewed = word.reviewed && !word.soundsWrong;
            const isWrong = word.soundsWrong;

            let className = 'word-span';
            if (reviewInteraction.reviewMode) {
              if (isWrong) {
                className += isCurrentReview ? ' wrong current-review' : ' wrong';
              } else if (isReviewed) {
                className += isCurrentReview ? ' ok current-review' : ' ok';
              } else if (isCurrentReview) {
                className += ' current-review';
              }
            } else {
              // In activity mode, only show current review styling
              if (isCurrentReview) {
                className += ' current-review';
              }
            }

            return (
              <span
                key={word.word}
                className={className}
                onClick={() => reviewInteraction.reviewWord(word.word)}
              >
                {word.word}
              </span>
            );
          })}

          {reviewInteraction.hasMoreWords && (
            <button
              className="word-span ellipsis-button"
              title={reviewInteraction.showMoreWordsAction.tooltip}
              onClick={() => reviewInteraction.showMoreWordsAction.doAction()}
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
 * Main view component for Review Pronunciation page
 */
interface ReviewPronunciationViewProps {
  reviewInteraction: ReviewPronunciationInteraction;
}

export const ReviewPronunciationView: React.FC<ReviewPronunciationViewProps> = observer(({ reviewInteraction }) => {
  // Add keyboard event listener for arrow key navigation and space bar toggle
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        if (reviewInteraction.autoplaying) {
          reviewInteraction.stopAutoplay();
        }
        reviewInteraction.gotoNextWord();
      } else if (e.key === 'ArrowRight' && !e.ctrlKey && e.altKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        if (!reviewInteraction.autoplaying) {
          reviewInteraction.startAutoplay();
        }
      } else if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        if (reviewInteraction.autoplaying) {
          reviewInteraction.stopAutoplay();
        }
        reviewInteraction.gotoPreviousWord();
      } else if (e.key === ' ' && reviewInteraction.currentReviewWord && reviewInteraction.reviewMode) {
        e.preventDefault();
        if (reviewInteraction.autoplaying) {
          reviewInteraction.stopAutoplay();
        }
        if (reviewInteraction.currentReviewWord.soundsWrong) {
          reviewInteraction.markOK(reviewInteraction.currentReviewWord.word);
        } else {
          reviewInteraction.markSoundsWrong(reviewInteraction.currentReviewWord.word);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (reviewInteraction.autoplaying) {
          reviewInteraction.stopAutoplay();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [reviewInteraction]);

  return (
    <div className={`review-pronunciation-container ${reviewInteraction.reviewMode ? '' : 'activity-mode'}`}>
      {reviewInteraction.reviewMode && (
        <ReviewActionControls
          reviewInteraction={reviewInteraction}
          reviewStateFileLoader={(file: File) => reviewInteraction.loadReviewStateFromFile(file)}
        />
      )}
      <ReviewPronunciationFilters reviewInteraction={reviewInteraction} />
      <ReviewStateControls reviewInteraction={reviewInteraction} />
      <ReviewPronunciationWordChoice reviewInteraction={reviewInteraction} />
    </div>
  );
});

/**
 * Full page component for Review Pronunciation page
 */
interface ReviewPronunciationPageProps { appState: AppState; }

export const ReviewPronunciationPage: React.FC<ReviewPronunciationPageProps> = observer(({ appState }) => {
  return (
    <ReviewPronunciationView reviewInteraction={appState.reviewPronunciationInteraction} />
  );
});
