import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { Pronunciation } from '@/models/pronunciation/pronunciation';
import { ActionButton } from '@/lib/views/action-button';

/**
 * Review mode action controls component for Pronunciation page
 */
interface ReviewStateControlsProps {
  pronunciationInteraction: Pronunciation;
  reviewStateFileLoader: (file: File) => void;
}

export const ReviewStateControls: React.FC<ReviewStateControlsProps> = observer(({ pronunciationInteraction, reviewStateFileLoader }) => {

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
 * Review mode filters component for Pronunciation page
 */
interface PronunciationReviewFiltersProps {
  pronunciationInteraction: Pronunciation;
}

export const PronunciationReviewFilters: React.FC<PronunciationReviewFiltersProps> = observer(({ pronunciationInteraction }) => {
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
        </div>
      </div>
    </div>
  );
});

/**
 * Review mode state controls component for Pronunciation page
 */
interface PronunciationReviewStateControlsProps {
  pronunciationInteraction: Pronunciation;
}

export const PronunciationReviewStateControls: React.FC<PronunciationReviewStateControlsProps> = observer(({ pronunciationInteraction }) => {
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

        <div className="review-buttons">
          <ActionButton action={pronunciationInteraction.markSoundsWrongAction}>
            Sounds Wrong
          </ActionButton>

          <ActionButton action={pronunciationInteraction.markOKAction}>
            Sounds OK
          </ActionButton>
        </div>

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
 * Review mode word choice component for Pronunciation page
 */
interface PronunciationReviewWordChoiceProps {
  pronunciationInteraction: Pronunciation;
}

export const PronunciationReviewWordChoice: React.FC<PronunciationReviewWordChoiceProps> = observer(({ pronunciationInteraction }) => {
  const keyboardHint = "Use ← → arrow keys to navigate, Alt+→ to start autoplay, space bar to toggle sounds wrong";

  return (
    <div className="pronunciation-word-choice">
      {/* Filtered Words */}
      <div className="filtered-words">
        <div className="words-header">
          <span className="words-count">Words: {pronunciationInteraction.filteredWords.length}</span>
          <div className="keyboard-shortcuts">
            <span className="shortcut-hint">{keyboardHint}</span>
          </div>
        </div>

        <div className={clsx('words-grid', 'touch-interactive-area')}>
          {pronunciationInteraction.displayedWords.map(word => {
            const isCurrentReview = word.currentReview;
            const isReviewed = word.reviewed && !word.soundsWrong;
            const isWrong = word.soundsWrong;

            const className = clsx('word-span', {
              'wrong': isWrong,
              'ok': isReviewed && !isWrong,
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
        </div>
      </div>
    </div>
  );
});

/**
 * Review page component for Pronunciation
 */
interface PronunciationReviewPageProps {
  pronunciationInteraction: Pronunciation;
}

export const PronunciationReviewPage: React.FC<PronunciationReviewPageProps> = observer(({ pronunciationInteraction }) => {
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
      } else if (e.key === ' ' && pronunciationInteraction.currentWord) {
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

  // Ensure we're in review mode
  React.useEffect(() => {
    if (!pronunciationInteraction.reviewMode) {
      pronunciationInteraction.setReviewMode(true);
    }
  }, [pronunciationInteraction]);

  return (
    <div className={clsx('pronunciation-container')}>
      <ReviewStateControls
        pronunciationInteraction={pronunciationInteraction}
        reviewStateFileLoader={(file: File) => pronunciationInteraction.loadReviewStateFromFile(file)}
      />
      <PronunciationReviewFilters pronunciationInteraction={pronunciationInteraction} />
      <PronunciationReviewStateControls pronunciationInteraction={pronunciationInteraction} />
      <PronunciationReviewWordChoice pronunciationInteraction={pronunciationInteraction} />
    </div>
  );
});
