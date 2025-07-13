import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { PronunciationReview } from '@/models/pronunciation/pronunciation-review';
import { ActionButton } from '@/lib/views/action-button';
import { FilterControls } from '@/lib/views/filter-controls';
import { Panel } from '@/lib/views/panel';
import { Inspectable } from '@/lib/inspector';
import { Page } from '@/lib/views/page';

/**
 * Review mode action controls component for Pronunciation page
 */
interface ReviewStateControlsProps {
  pronunciation: PronunciationReview;
  reviewStateFileLoader: (file: File) => void;
}

export const ReviewStateControls: React.FC<ReviewStateControlsProps> = observer(({ pronunciation, reviewStateFileLoader }) => {

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
    <Panel 
      visible={true} 
      inspectorTitle="ReviewStateControls"
      helpTitle="Review State Controls"
      helpContent="* **Load State** - Drag & drop or click to load saved pronunciation review state\n* **Save State** - Download current pronunciation review state\n* **Download Wrong Words** - Get list of words marked as sounding wrong\n* **Reset** - Reset all words to unreviewed or OK state\n* **Review Wrong Words** - Filter to show only words marked as sounding wrong"
    >
      <div className="action-buttons-panel">
        <div
          className="load-state-button-container"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <ActionButton action={pronunciation.loadStateAction}>
            + Load State
          </ActionButton>
        </div>

        <ActionButton action={pronunciation.saveStateAction}>
          Save State
        </ActionButton>

        <ActionButton action={pronunciation.downloadWrongWordsAction}>
          Download Wrong Words
        </ActionButton>

        <ActionButton action={pronunciation.resetAllToUnreviewedAction}>
          Reset All to Unreviewed
        </ActionButton>

        <ActionButton action={pronunciation.resetAllToOKAction}>
          Reset All to OK
        </ActionButton>

        <ActionButton action={pronunciation.reviewWrongWordsAction}>
          Review Wrong Words
        </ActionButton>
      </div>
    </Panel>
  );
});

/**
 * Review mode filters component for Pronunciation page
 */
interface PronunciationReviewFiltersProps {
  pronunciation: PronunciationReview;
}

export const PronunciationReviewFilters: React.FC<PronunciationReviewFiltersProps> = observer(({ pronunciation }) => {
  return (
    <Panel 
      visible={true} 
      inspectorTitle="PronunciationReviewFilters"
      helpTitle="Review Filters"
      helpContent="* **Filter text** - sub-string to match against word\n* **Match** - start/end/any position matching\n* **Review state** - filter by unreviewed, wrong, OK, or all words"
    >
      <div className="filter-controls">
        <FilterControls filter={pronunciation.filter} />

        <div className="review-state-filter">
          <label htmlFor="review-state-select">Review state:</label>
          <select
            id="review-state-select"
            value={pronunciation.reviewStateFilterOptions.indexOf(pronunciation.reviewStateFilter)}
            onChange={(e) => {
              const index = parseInt(e.target.value);
              pronunciation.setReviewStateFilter(pronunciation.reviewStateFilterOptions[index]);
            }}
          >
            {pronunciation.reviewStateFilterOptions.map((option, index) => (
              <option key={index} value={index}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Panel>
  );
});

/**
 * Review mode state controls component for Pronunciation page
 */
interface PronunciationReviewStateControlsProps {
  pronunciation: PronunciationReview;
}

export const PronunciationReviewStateControls: React.FC<PronunciationReviewStateControlsProps> = observer(({ pronunciation }) => {
  return (
    <Panel 
      visible={true} 
      inspectorTitle="PronunciationReviewStateControls"
      helpTitle="Review Current Word"
      helpContent="* **Sounds Wrong** - mark current word as sounding wrong\n* **Sounds OK** - mark current word as sounding correct\n* **Auto** - automatically move through words\n* **Speed** - adjust autoplay interval"
    >
      <div className="current-review-word">
        <span
          className={clsx('word-span', {
            'no-word': !pronunciation.currentWord,
            'wrong current-review': pronunciation.currentWord?.soundsWrong,
            'ok current-review': pronunciation.currentWord && !pronunciation.currentWord.soundsWrong
          })}
        >
          {pronunciation.currentWord ? pronunciation.currentWord.word : '\u00A0'}
        </span>

        <div className="review-buttons">
          <ActionButton action={pronunciation.markSoundsWrongAction}>
            Sounds Wrong
          </ActionButton>

          <ActionButton action={pronunciation.markOKAction}>
            Sounds OK
          </ActionButton>
        </div>

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
    </Panel>
  );
});

/**
 * Review mode word choice component for Pronunciation page
 */
interface PronunciationReviewWordChoiceProps {
  pronunciation: PronunciationReview;
}

export const PronunciationReviewWordChoice: React.FC<PronunciationReviewWordChoiceProps> = observer(({ pronunciation }) => {
  const keyboardHint = "Use ← → arrow keys to navigate, Alt+→ to start autoplay, space bar to toggle sounds wrong";

  return (
    <Panel 
      visible={false} 
      inspectorTitle="PronunciationReviewWordChoice"
      helpTitle="Review Word List"
      helpContent="* Click on a word to review that word\n* Keyboard shortcuts:\n  * ← go to previous word\n  * → go to next word\n  * Alt-→ start autoplay\n  * Space bar to toggle sounds wrong"
    >
      <div className="pronunciation-word-choice">
        {/* Filtered Words */}
        <div className="filtered-words">
          <div className="words-header">
            <span className="words-count">Words: {pronunciation.filteredWords.length}</span>
            <div className="keyboard-shortcuts">
              <span className="shortcut-hint">{keyboardHint}</span>
            </div>
          </div>

          <div className={clsx('words-grid', 'touch-interactive-area')}>
            {pronunciation.displayedWords.map(word => {
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
                  onClick={() => pronunciation.reviewWord(word)}
                >
                  {word.word}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
});

/**
 * Review page component for Pronunciation
 */
interface PronunciationReviewPageProps {
  pronunciation: PronunciationReview;
}

export const PronunciationReviewPage: React.FC<PronunciationReviewPageProps> = observer(({ pronunciation }) => {
  // Add keyboard event listener for arrow key navigation and space bar toggle
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
      } else if (e.key === ' ' && pronunciation.currentWord) {
        e.preventDefault();
        if (pronunciation.autoplaying) {
          pronunciation.stopAutoplay();
        }
        if (pronunciation.currentWord.soundsWrong) {
          pronunciation.markOK(pronunciation.currentWord);
        } else {
          pronunciation.markSoundsWrong(pronunciation.currentWord);
        }
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


  return (
    <Inspectable name="PronunciationReviewPage">
      <Page>
        <div className={clsx('pronunciation-container')}>
          <ReviewStateControls
            pronunciation={pronunciation}
            reviewStateFileLoader={(file: File) => pronunciation.loadReviewStateFromFile(file)}
          />
          <PronunciationReviewFilters pronunciation={pronunciation} />
          <PronunciationReviewStateControls pronunciation={pronunciation} />
          <PronunciationReviewWordChoice pronunciation={pronunciation} />
        </div>
      </Page>
    </Inspectable>
  );
});
