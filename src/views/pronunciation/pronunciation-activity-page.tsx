import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { PronunciationActivity } from '@/models/pronunciation/pronunciation-activity';
import { ActionButton } from '@/lib/views/action-button';
import { FilterControls } from '@/lib/views/filter-controls';
import { Panel } from '@/lib/views/panel';
import { GroupRight } from '@/lib/views/group-right';
import { Inspectable } from '@/lib/inspector';
import { Page } from '@/lib/views/page';
import { Help } from '@/lib/components/help';

/**
 * Activity mode control panel component with filters on left and Auto button on right
 */
interface PronunciationActivityControlsProps {
  pronunciation: PronunciationActivity;
}

export const PronunciationActivityControls: React.FC<PronunciationActivityControlsProps> = observer(({ pronunciation }) => {
  return (
    <Panel
      visible={true}
      inspectorTitle="PronunciationActivityControls"
    >
      <Help title="Filter Controls & Auto">
        * **Filter text** sub-string to match against word
        * **Match:**
          * **start** match sub-string to start of word
          * **end** match sub-string to end of word
          * **any** match sub-string anywhere in word
        * **Auto** start auto-playing the words
      </Help>
      <FilterControls filter={pronunciation.filter} />

      <GroupRight>
        <ActionButton action={pronunciation.autoplayAction}>
          {pronunciation.autoplaying ? 'Stop' : 'Auto'}
        </ActionButton>
      </GroupRight>
    </Panel>
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
    <Panel
      visible={false}
      inspectorTitle="PronunciationActivityWordChoice"
    >
      <Help title="Filtered Word List">
        * Click on a word to pronounce that word
        * Click on '...' to double maximum number of filtered words displayed
        * Click on '↻' to reset maximum to 20
        * Keyboard shortcuts:
          * ← go to previous word
          * → go to next word
          * Alt-→ start autoplay
      </Help>
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
    </Panel>
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


  return (
    <Inspectable name="PronunciationActivityPage">
      <Page>
        <div className={clsx('pronunciation-container', 'activity-mode')}>
          <PronunciationActivityControls pronunciation={pronunciation} />
          <PronunciationActivityWordChoice pronunciation={pronunciation} />
        </div>
      </Page>
    </Inspectable>
  );
});
