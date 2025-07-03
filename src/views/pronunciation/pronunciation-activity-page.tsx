import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { PronunciationActivity } from '@/models/pronunciation/pronunciation-activity';
import { ActionButton } from '@/lib/views/action-button';
import { FilterControls } from '@/lib/views/filter-controls';

/**
 * Activity mode filters component for Pronunciation page
 */
interface PronunciationActivityFiltersProps {
  pronunciation: PronunciationActivity;
}

export const PronunciationActivityFilters: React.FC<PronunciationActivityFiltersProps> = observer(({ pronunciation }) => {
  return (
    <div className="pronunciation-filters">
      <div className="filter-panel">
        <FilterControls filter={pronunciation.filter} />
      </div>
    </div>
  );
});

/**
 * Activity mode state controls component for Pronunciation page
 */
interface PronunciationActivityStateControlsProps {
  pronunciation: PronunciationActivity;
}

export const PronunciationActivityStateControls: React.FC<PronunciationActivityStateControlsProps> = observer(({ pronunciation }) => {
  return (
    <div className="word-changer-panel">
      <div className="current-review-word">
        <span
          className={clsx('word-span', {
            'no-word': !pronunciation.currentWord
          })}
        >
          {pronunciation.currentWord ? pronunciation.currentWord.word : '\u00A0'}
        </span>

        <div className="autoplay-controls">
          <ActionButton action={pronunciation.autoplayAction}>
            {pronunciation.autoplaying ? 'Stop' : 'Auto'}
          </ActionButton>

          <select
            value={pronunciation.autoPlayWaitMillis}
            onChange={(e) => {
              pronunciation.stopAutoplay();
              pronunciation.setAutoPlayWaitMillis(parseInt(e.target.value));
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
 * Activity mode word choice component for Pronunciation page
 */
interface PronunciationActivityWordChoiceProps {
  pronunciation: PronunciationActivity;
}

export const PronunciationActivityWordChoice: React.FC<PronunciationActivityWordChoiceProps> = observer(({ pronunciation }) => {
  const keyboardHint = "Use ← → arrow keys to navigate, Alt+→ to start autoplay";

  return (
    <div className="pronunciation-word-choice">
      {/* Filtered Words */}
      <div className="filtered-words">
        <div className="words-header">
          <span className="words-count">Words: {pronunciation.filteredWords.length}</span>
          <div className="keyboard-shortcuts">
            <ActionButton action={pronunciation.resetMaxWordsAction}>
              ↻...
            </ActionButton>
            <span className="shortcut-hint">{keyboardHint}</span>
          </div>
        </div>

        <div className={clsx('words-grid', 'touch-interactive-area', 'activity-mode')}>
          {pronunciation.displayedWords.map(word => {
            const isCurrentReview = word.currentReview;

            const className = clsx('word-span', {
              'current-review': isCurrentReview
            });

            return (
              <span
                key={word.word}
                className={className}
                onClick={() => pronunciation.reviewWord(word)}
              >
                {word.word}
              </span>
            );
          })}

          {pronunciation.hasMoreWords && (
            <button
              className={clsx('word-span', 'ellipsis-button')}
              title={pronunciation.showMoreWordsAction.tooltip}
              onClick={() => pronunciation.showMoreWordsAction.doAction()}
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
 * Activity page component for Pronunciation
 */
interface PronunciationActivityPageProps {
  pronunciation: PronunciationActivity;
}

export const PronunciationActivityPage: React.FC<PronunciationActivityPageProps> = observer(({ pronunciation }) => {
  // Add keyboard event listener for arrow key navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        if (pronunciation.autoplaying) {
          pronunciation.stopAutoplay();
        }
        pronunciation.gotoNextWord();
      } else if (e.key === 'ArrowRight' && !e.ctrlKey && e.altKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        if (!pronunciation.autoplaying) {
          pronunciation.startAutoplay();
        }
      } else if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        if (pronunciation.autoplaying) {
          pronunciation.stopAutoplay();
        }
        pronunciation.gotoPreviousWord();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (pronunciation.autoplaying) {
          pronunciation.stopAutoplay();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [pronunciation]);

  // Ensure we're in activity mode
  React.useEffect(() => {
    if (pronunciation.reviewMode) {
      pronunciation.setReviewMode(false);
    }
  }, [pronunciation]);

  return (
    <div className={clsx('pronunciation-container', 'activity-mode')}>
      <PronunciationActivityFilters pronunciation={pronunciation} />
      <PronunciationActivityStateControls pronunciation={pronunciation} />
      <PronunciationActivityWordChoice pronunciation={pronunciation} />
    </div>
  );
});
