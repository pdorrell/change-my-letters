import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { MenuManagerInterface } from '@/lib/views/menu-manager-interface';
import { WordSelectionByLetter } from '@/models/changer/word-selection-by-letter';
import { ButtonAction } from '@/lib/models/actions';

/**
 * View component for the letter choice menu
 */
interface LetterChoiceMenuProps {
  wordSelectionByLetter: WordSelectionByLetter;
  menuManager: MenuManagerInterface;
  menuRef?: React.RefObject<HTMLDivElement>;
  deleteAction?: ButtonAction;
}

export const LetterChoiceMenu: React.FC<LetterChoiceMenuProps> = observer(({ wordSelectionByLetter, menuManager, menuRef, deleteAction }) => {
  const { options, onSelect } = wordSelectionByLetter;
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to dismiss
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        // Close the menu by triggering the menu manager
        menuManager.closeMenus();
      }
    };

    // Add event listener with a slight delay to avoid immediate closure
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuManager]);

  // Stop propagation of clicks within the menu to prevent the global handler from closing it
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={menuContainerRef}
      className="letter-choice-menu-container"
      role="menu"
    >
      <div
        ref={menuRef}
        className="letter-choice-menu"
        onClick={handleMenuClick}
      >
          {deleteAction && (
            <div
              key="delete-option"
              className={clsx('letter-choice-option', 'delete-option')}
              onClick={(e) => {
                e.stopPropagation();
                deleteAction.doAction();
              }}
              title={deleteAction.tooltip}
            >
              🗑️
            </div>
          )}
          {options.map((change, index) => {
            const letter = change.letter;
            const resultWord = change.result;

            // Check if this letter would lead to a previously visited word
            const isPreviouslyVisited = resultWord.previouslyVisited;

            return (
              <div
                key={`option-${index}`}
                className={clsx('letter-choice-option', { 'previously-visited': isPreviouslyVisited })}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(resultWord);
                }}
              >
                {letter}
              </div>
            );
          })}
        </div>
      </div>
  );
});
