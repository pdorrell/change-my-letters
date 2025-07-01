import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { Pronunciation } from '@/models/pronunciation/pronunciation';
import { ActionButton } from '@/lib/views/action-button';

/**
 * Activity mode filters component for Pronunciation page
 */
interface PronunciationActivityFiltersProps {
  pronunciationInteraction: Pronunciation;
}

export const PronunciationActivityFilters: React.FC<PronunciationActivityFiltersProps> = observer(({ pronunciationInteraction }) => {
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

          <div className="auto-control">
            <button
              title={pronunciationInteraction.autoplayAction.tooltip}
              onClick={() => pronunciationInteraction.autoplayAction.doAction()}
            >
              Auto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Activity mode state controls component for Pronunciation page
 */
interface PronunciationActivityStateControlsProps {
  pronunciationInteraction: Pronunciation;
}

export const PronunciationActivityStateControls: React.FC<PronunciationActivityStateControlsProps> = observer(({ pronunciationInteraction }) => {
  return (
    <div className="word-changer-panel">
      <div className="current-review-word">
        <span
          className={clsx('word-span', {
            'no-word': !pronunciationInteraction.currentWord
          })}
        >
          {pronunciationInteraction.currentWord ? pronunciationInteraction.currentWord.word : '\u00A0'}
        </span>

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
 * Activity mode word choice component for Pronunciation page
 */
interface PronunciationActivityWordChoiceProps {
  pronunciationInteraction: Pronunciation;
}

export const PronunciationActivityWordChoice: React.FC<PronunciationActivityWordChoiceProps> = observer(({ pronunciationInteraction }) => {
  const keyboardHint = "Use ← → arrow keys to navigate, Alt+→ to start autoplay";

  return (
    <div className="pronunciation-word-choice">
      {/* Filtered Words */}
      <div className="filtered-words">
        <div className="words-header">
          <span className="words-count">Words: {pronunciationInteraction.filteredWords.length}</span>
          <div className="keyboard-shortcuts">
            <ActionButton action={pronunciationInteraction.resetMaxWordsAction}>
              ↻...
            </ActionButton>
            <span className="shortcut-hint">{keyboardHint}</span>
          </div>
        </div>

        <div className={clsx('words-grid', 'touch-interactive-area', 'activity-mode')}>
          {pronunciationInteraction.displayedWords.map(word => {
            const isCurrentReview = word.currentReview;

            const className = clsx('word-span', {
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
 * Activity page component for Pronunciation
 */
interface PronunciationActivityPageProps {
  pronunciationInteraction: Pronunciation;
}

export const PronunciationActivityPage: React.FC<PronunciationActivityPageProps> = observer(({ pronunciationInteraction }) => {
  // Add keyboard event listener for arrow key navigation
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

  // Ensure we're in activity mode
  React.useEffect(() => {
    if (pronunciationInteraction.reviewMode) {
      pronunciationInteraction.setReviewMode(false);
    }
  }, [pronunciationInteraction]);

  return (
    <div className={clsx('pronunciation-container', 'activity-mode')}>
      <PronunciationActivityFilters pronunciationInteraction={pronunciationInteraction} />
      <PronunciationActivityStateControls pronunciationInteraction={pronunciationInteraction} />
      <PronunciationActivityWordChoice pronunciationInteraction={pronunciationInteraction} />
    </div>
  );
});
