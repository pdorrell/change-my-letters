import React from 'react';
import { observer } from 'mobx-react-lite';
import { CurrentWord } from '../models/CurrentWord';
import { LetterView, LetterPlaceholder } from './LetterView';
import { PositionView, PositionPlaceholder } from './PositionView';

interface CurrentWordViewProps {
  currentWord: CurrentWord;
}

/**
 * View component for displaying the current word
 */
export const CurrentWordView: React.FC<CurrentWordViewProps> = observer(({ currentWord }) => {
  const appState = currentWord.appState;

  // Add a document-wide click handler to close menus when clicking outside
  React.useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // If there's an active menu
      if (appState.activeMenuType !== 'none') {
        // Check if click is outside of menus
        // We don't close if clicked on letter-choice-menu, letter-choice-option,
        // or replace-icon/insert-icon buttons which handle their own clicks
        const target = e.target as HTMLElement;
        const menuClick =
          target.classList.contains('letter-choice-menu') ||
          target.classList.contains('letter-choice-option') ||
          target.classList.contains('replace-icon') ||
          target.classList.contains('insert-icon');

        if (!menuClick) {
          appState.closeAllMenus();
        }
      }
    };

    // Add the click handler to document
    document.addEventListener('click', handleGlobalClick);

    // Clean up on component unmount
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [appState]);

  // Get maximum word length from the word graph
  const getMaxWordLength = (): number => {
    let maxWordLength = 0;

    // Only try to get max word length from wordGraph if it exists
    if (appState.wordGraph?.words && appState.wordGraph.words.size > 0) {
      try {
        maxWordLength = Math.max(
          ...Array.from(appState.wordGraph.words).map(word => word.length)
        );
      } catch (error) {
        // In case of an error, use a reasonable default
        console.debug('Could not calculate max word length from word graph, using default of 5');
        maxWordLength = 5;
      }
    } else {
      // Default to 5 if no words are loaded yet
      maxWordLength = 5;
    }

    return maxWordLength;
  };

  // Get the current word length
  const currentWordLength = currentWord.value.length;

  // Get the maximum word length from the word graph
  const maxWordLength = getMaxWordLength();

  // Calculate placeholders needed
  const placeholdersNeeded = Math.max(0, maxWordLength - currentWordLength);

  return (
    <div
      className={`word-outer-container ${currentWord.previouslyVisited ? 'previously-visited' : ''}`}
    >
      <div className="current-word-container">
        <div className="word-display">
          {/* Render alternating sequence of positions and letters for the current word */}
          {currentWord.positions.map((position, index) => (
            <React.Fragment key={`position-${index}`}>
              <PositionView position={position} />
              {index < currentWord.letters.length && (
                <LetterView letter={currentWord.letters[index]} />
              )}
            </React.Fragment>
          ))}

          {/* Add placeholders to fill up to max word length */}
          {placeholdersNeeded > 0 && Array(placeholdersNeeded).fill(0).map((_, index) => (
            <React.Fragment key={`placeholder-${index}`}>
              <LetterPlaceholder />
              <PositionPlaceholder />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
});

/**
 * View component for the letter choice menu
 */
export const LetterChoiceMenu: React.FC<{
  options: string[],
  onSelect: (letter: string) => void,
  previouslyVisited: string[]
}> = ({ options, onSelect, previouslyVisited }) => {
  // This dummy appState will be set when the menu is opened from a letter or position
  let appState: any = null;

  if (options.length > 0 && options[0] && typeof window !== 'undefined') {
    // Try to get appState from a global property we'll set when opening the menu
    const activeElem = document.activeElement;
    if (activeElem && (activeElem as any).__appState) {
      appState = (activeElem as any).__appState;
    }
  }

  const menuRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  // Calculate the position of the menu when it mounts
  React.useEffect(() => {
    // Get the button element directly from appState
    const activeButton = appState?.activeButtonElement;

    if (activeButton && menuRef.current) {
      const buttonRect = activeButton.getBoundingClientRect();
      const menuWidth = menuRef.current.offsetWidth || 250;

      // Position the menu centered below the button
      setPosition({
        top: buttonRect.bottom + window.scrollY + 5, // 5px below the button
        left: Math.max(10, Math.min(
          window.innerWidth - menuWidth - 10,
          buttonRect.left + window.scrollX - (menuWidth / 2) + (buttonRect.width / 2)
        ))
      });
    } else {
      // Fallback position if no button element is found
      setPosition({
        top: 100,
        left: 100
      });
    }
  }, [appState?.activeButtonElement]);

  // Stop propagation of clicks within the menu to prevent the global handler from closing it
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={menuRef}
      className="letter-choice-menu"
      onClick={handleMenuClick}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {options.map((letter, index) => {
        // Check if this letter would lead to a previously visited word
        const isPreviouslyVisited = previouslyVisited.includes(letter);

        return (
          <div
            key={`option-${index}`}
            className={`letter-choice-option ${isPreviouslyVisited ? 'previously-visited' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(letter);
            }}
          >
            {letter}
          </div>
        );
      })}
    </div>
  );
};