import React from 'react';
import { WordSelectionByLetter } from '../../src/models/WordSelectionByLetter';
import { MenuManager } from '../../src/models/MenuManager';
import {
  createFloatingUITestDouble,
  createUseInteractionsTestDouble,
  createUseDismissTestDouble,
  createUseRoleTestDouble
} from './FloatingUITestDouble';

/**
 * Test double version of LetterChoiceMenu that doesn't use real floating-ui
 */
interface LetterChoiceMenuProps {
  wordSelectionByLetter: WordSelectionByLetter;
  menuManager: MenuManager;
}

export const LetterChoiceMenuTestDouble: React.FC<LetterChoiceMenuProps> = ({ wordSelectionByLetter, menuManager }) => {
  const { options, onSelect } = wordSelectionByLetter;
  
  // Using test doubles instead of real floating-ui hooks
  const { refs, floatingStyles, context } = createFloatingUITestDouble();
  const dismiss = createUseDismissTestDouble();
  const role = createUseRoleTestDouble();
  const { getFloatingProps } = createUseInteractionsTestDouble();

  // Stop propagation of clicks within the menu to prevent the global handler from closing it
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={refs.setFloating}
      className="letter-choice-menu"
      onClick={handleMenuClick}
      style={{
        ...floatingStyles,
        zIndex: 9999, // Ensure it's on top of everything
      }}
      {...getFloatingProps()}
    >
      {options.map((change, index) => {
        const letter = change.letter;
        const resultWord = change.result;

        // Check if this letter would lead to a previously visited word
        const isPreviouslyVisited = resultWord.previouslyVisited;

        return (
          <div
            key={`option-${index}`}
            className={`letter-choice-option ${isPreviouslyVisited ? 'previously-visited' : ''}`}
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
  );
};