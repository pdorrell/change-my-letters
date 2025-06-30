import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { LetterInteraction } from '@/models/interaction/letter-interaction';
import { LetterChoiceMenu } from '@/views/changer/word-changer';

/**
 * Placeholder component that maintains the same dimensions as a letter
 * but is invisible to the user
 */
export const LetterPlaceholder: React.FC = observer(() => {
  return (
    <div className="letter-container">
      <div className={clsx('letter', 'hidden')} data-testid="letter-view">
        <span className="letter-text">x</span>
        <div className={clsx('delete-icon-inside', 'hidden')}>🗑️</div>
        <div className={clsx('replace-icon-inside', 'hidden')}>🔄</div>
      </div>
    </div>
  );
});

/**
 * View component for displaying a single letter
 */
interface LetterViewProps { letterInteraction: LetterInteraction; }

export const LetterView: React.FC<LetterViewProps> = observer(({ letterInteraction }) => {
  const letter = letterInteraction.letter;

  // Delete action is now handled by letterInteraction.deleteAction
  // Replace action is now handled by letterInteraction.openReplaceMenuAction

  // Case change handler has been removed


  return (
    <div className={clsx('letter-container', { 'action-pending': letterInteraction.actionPending })}>
      <div
        ref={letterInteraction.menuRef}
        className={clsx('letter', { clickable: letterInteraction.letterClickAction.enabled })}
        onClick={letterInteraction.letterClickAction.enabled ? (e) => {
          // Ensure the click is handled regardless of what element was clicked
          e.preventDefault();
          e.stopPropagation();
          letterInteraction.letterClickAction.doAction();
        } : undefined}
        title={letterInteraction.letterClickAction.tooltip}
      >
        <span
          className="letter-text"
          onClick={letterInteraction.letterClickAction.enabled ? (e) => {
            e.preventDefault();
            e.stopPropagation();
            letterInteraction.letterClickAction.doAction();
          } : undefined}
        >
          {letter.value}
        </span>

        <div
          className={clsx('delete-icon-inside', { hidden: !letterInteraction.deleteAction.enabled || !letterInteraction.showChangeHints })}
          onClick={letterInteraction.letterClickAction.enabled ? (e) => {
            e.preventDefault();
            e.stopPropagation();
            letterInteraction.letterClickAction.doAction();
          } : undefined}
        >
          🗑️
        </div>

        <div
          className={clsx('replace-icon-inside', { hidden: !letterInteraction.openReplaceMenuAction.enabled || !letterInteraction.showChangeHints })}
          onClick={letterInteraction.letterClickAction.enabled ? (e) => {
            e.preventDefault();
            e.stopPropagation();
            letterInteraction.letterClickAction.doAction();
          } : undefined}
        >
          🔄
        </div>
      </div>

      {letterInteraction.isReplaceMenuOpen && (
        <LetterChoiceMenu
          wordSelectionByLetter={letterInteraction.selectionOfReplacementLetter}
          menuManager={letterInteraction.menuManager}
          menuRef={letterInteraction.replaceMenuRef}
          deleteAction={letterInteraction.deleteAction.enabled ? letterInteraction.deleteAction : undefined}
        />
      )}
    </div>
  );
});
