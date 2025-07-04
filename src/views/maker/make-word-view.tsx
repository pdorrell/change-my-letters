import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { Word } from '@/models/Word';
import { range } from '@/lib/util';
import { LetterView, LetterPlaceholder } from '@/views/Letter';
import { PositionView, PositionPlaceholder } from '@/views/Position';
import { ActionButton } from '@/lib/views/action-button';
import { ButtonAction } from '@/lib/models/actions';
import { MakerCurrentWord } from '@/models/maker/maker-current-word';
import { Inspectable } from '@/lib/inspector';

interface MakeWordViewProps {
  word: Word | null;
  maxWordLength: number;
  backgroundClass: string;
  showControls: boolean;
  wordInteraction?: MakerCurrentWord;
  newWordAction?: ButtonAction;
  deleteAction?: ButtonAction;
}

export const MakeWordView: React.FC<MakeWordViewProps> = observer(({
  word,
  maxWordLength,
  backgroundClass,
  showControls,
  wordInteraction,
  newWordAction,
  deleteAction
}) => {
  // Add a document-wide click handler to close menus when clicking outside (for interactive words)
  React.useEffect(() => {
    if (!wordInteraction) return;

    const handleGlobalClick = (e: MouseEvent) => {
      // Access the letter and position interactions from the wordInteraction
      const letterInteractions = wordInteraction.wordInteraction.letterInteractions;
      const positionInteractions = wordInteraction.wordInteraction.positionInteractions;

      // Check if there are any open menus by examining the interactions
      const hasOpenMenus = letterInteractions.some(li => li.actionPending) ||
                          positionInteractions.some(pi => pi.actionPending);

      // If there's an active menu
      if (hasOpenMenus) {
        // Check if click is outside of menus
        const target = e.target;
        let menuClick = false;

        if (target && target instanceof Element) {
          menuClick =
            target.classList.contains('letter-choice-menu') ||
            target.classList.contains('letter-choice-option') ||
            target.classList.contains('insert-icon') ||
            target.classList.contains('letter-text') ||
            (target.classList.contains('letter') && target.classList.contains('clickable'));
        }

        if (!menuClick) {
          wordInteraction.closeAllMenus();
        }
      }
    };

    // Add the click handler to document
    document.addEventListener('click', handleGlobalClick);

    // Clean up on component unmount
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [wordInteraction]);

  function getPositionView(index: number): React.ReactElement {
    if (wordInteraction) {
      // Use the word interaction's position interactions
      const positionInteraction = index < wordInteraction.wordInteraction.positionInteractions.length ?
        wordInteraction.wordInteraction.positionInteractions[index] : null;
      return positionInteraction ? <PositionView positionInteraction={positionInteraction} /> : <PositionPlaceholder/>;
    } else {
      // For non-interactive words, just show placeholders
      return <PositionPlaceholder/>;
    }
  }

  function getLetterView(index: number): React.ReactElement {
    if (wordInteraction) {
      // Use the word interaction's letter interactions
      const letterInteraction = index < wordInteraction.wordInteraction.letterInteractions.length ?
        wordInteraction.wordInteraction.letterInteractions[index] : null;
      return letterInteraction ? <LetterView letterInteraction={letterInteraction} /> : <LetterPlaceholder/>;
    } else if (word) {
      // For non-interactive words, show static letters with proper styling
      const letter = word.letters[index];
      return letter ? (
        <div className="letter-container">
          <div className={clsx('letter', 'static')}>
            <span className="letter-text">{letter.value}</span>
          </div>
        </div>
      ) : <LetterPlaceholder/>;
    } else {
      // For null word (placeholder), always show empty placeholders
      return <LetterPlaceholder/>;
    }
  }

  return (
    <Inspectable label="MakeWordView">
      <div className="make-word-row">
        <div className={clsx('word-display', 'touch-interactive-area', backgroundClass)}>
          {/* Render alternating sequence of positions and letters */}
          {range(maxWordLength).map(index => (
            <React.Fragment key={`position--${index}`}>
              {getPositionView(index)}
              {getLetterView(index)}
            </React.Fragment>
          ))}
          <PositionPlaceholder/>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="make-word-controls">
            {newWordAction && (
              <ActionButton action={newWordAction} className="make-new-word-button">New Word</ActionButton>
            )}
            {deleteAction && (
              <button
                onClick={deleteAction.enabled ? () => deleteAction.doAction() : undefined}
                disabled={!deleteAction.enabled}
                className="make-delete-button"
                title={deleteAction.tooltip}
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
    </Inspectable>
  );
});
