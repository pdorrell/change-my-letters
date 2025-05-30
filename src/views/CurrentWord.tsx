import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordInteraction } from '../models/interaction/WordInteraction';
import { LetterView, LetterPlaceholder } from './Letter';
import { PositionView, PositionPlaceholder } from './Position';
import { MenuManagerInterface } from '../models/MenuManagerInterface';
import { AppState } from '../models/AppState';
import { ActionButton } from '../lib/ui/ActionButton';
import { CompactHistoryView } from './History';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  useInteractions,
  useRole,
  FloatingPortal
} from '@floating-ui/react';

/**
 * View component for displaying the current word
 */
interface CurrentWordViewProps { currentWord: WordInteraction; maxWordLength?: number; }

export const CurrentWordView: React.FC<CurrentWordViewProps> = observer(({ currentWord, maxWordLength }) => {

  // Add a document-wide click handler to close menus when clicking outside
  React.useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Check if there are any open menus by examining the interactions
      const hasOpenMenus = currentWord.letterInteractions.some(li => li.isReplaceMenuOpen) ||
                          currentWord.positionInteractions.some(pi => pi.isInsertMenuOpen);

      // If there's an active menu
      if (hasOpenMenus) {
        // Check if click is outside of menus
        // We don't close if clicked on letter-choice-menu, letter-choice-option,
        // or replace-icon/insert-icon buttons which handle their own clicks
        const target = e.target;
        let menuClick = false;

        if (target && target instanceof Element) {
          menuClick =
            target.classList.contains('letter-choice-menu') ||
            target.classList.contains('letter-choice-option') ||
            target.classList.contains('replace-icon') ||
            target.classList.contains('insert-icon');
        }

        if (!menuClick) {
          currentWord.menuManager.closeMenus();
        }
      }
    };

    // Add the click handler to document
    document.addEventListener('click', handleGlobalClick);

    // Clean up on component unmount
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [currentWord.menuManager]);

  // Get maximum word length
  const getMaxWordLength = (): number => {
    return maxWordLength || 5; // Use provided maxWordLength or fallback to 5
  };

  // Get the current word length
  const currentWordLength = currentWord.value.length;

  // Get the maximum word length
  const maxLength = getMaxWordLength();

  // Calculate placeholders needed
  const placeholdersNeeded = Math.max(0, maxLength - currentWordLength);

  return (
    <div
      className={`word-outer-container ${currentWord.word.previouslyVisited ? 'previously-visited' : ''}`}
    >
      <div className="current-word-container">
        <div className="word-display">
          {/* Render alternating sequence of positions and letters for the current word */}
          {currentWord.positionInteractions.map((positionInteraction, index) => (
            <React.Fragment key={`position-${index}`}>
              <PositionView positionInteraction={positionInteraction} />
              {index < currentWord.letterInteractions.length && (
                <LetterView letterInteraction={currentWord.letterInteractions[index]} />
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
import { WordSelectionByLetter } from '../models/WordSelectionByLetter';

interface LetterChoiceMenuProps {
  wordSelectionByLetter: WordSelectionByLetter;
  menuManager: MenuManagerInterface;
  menuRef?: React.RefObject<HTMLDivElement>;
}

export const LetterChoiceMenu: React.FC<LetterChoiceMenuProps> = ({ wordSelectionByLetter, menuManager, menuRef }) => {
  const { options, onSelect } = wordSelectionByLetter;
  // Using floating-ui for positioning
  const {refs, floatingStyles, context} = useFloating({
    // Set the reference to the active button element
    elements: {
      reference: menuManager.activeButtonElement ?? undefined
    },
    // Keep the position updated when elements resize/scroll/etc
    whileElementsMounted: autoUpdate,
    // Position the menu below the reference element by default
    placement: 'bottom',
    // Configure positioning behavior with middleware
    middleware: [
      offset(10), // 10px gap between reference and floating element
      flip({
        fallbackPlacements: ['top', 'left', 'right'],
        fallbackAxisSideDirection: 'end',
        padding: 20, // Add padding to avoid positioning too close to edges
      }), // Flip to opposite side if not enough space
      shift({
        padding: 20, // Add padding to avoid positioning too close to edges
        limiter: {
          // Allow the element to overflow the viewport if needed (e.g. for very large menus)
          options: {
            offset: () => ({ mainAxis: 20, crossAxis: 20, alignmentAxis: 0 }),
          },
          fn: (state) => state,
        },
      }) // Shift to keep within viewport
    ],
  });

  // Handle interactions for dismissal, accessibility, etc.
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });

  const {getFloatingProps} = useInteractions([
    dismiss,
    role
  ]);

  // Stop propagation of clicks within the menu to prevent the global handler from closing it
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={{
          ...floatingStyles,
          zIndex: 9999, // Ensure it's on top of everything
        }}
        {...getFloatingProps()}
      >
        <div
          ref={menuRef}
          className="letter-choice-menu"
          onClick={handleMenuClick}
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
      </div>
    </FloatingPortal>
  );
};

/**
 * App controls component for Current Word page
 */
interface CurrentWordAppControlsProps { appState: AppState; }

export const CurrentWordAppControls: React.FC<CurrentWordAppControlsProps> = ({ appState }) => {
  return (
    <div className="app-controls">
      <ActionButton action={appState.undoAction}>
        Undo
      </ActionButton>
      <ActionButton action={appState.redoAction}>
        Redo
      </ActionButton>
      <ActionButton action={appState.sayAction}>
        Say
      </ActionButton>
      <label className="say-immediately-container">
        <input
          type="checkbox"
          checked={appState.sayImmediately}
          onChange={(e) => {
            appState.sayImmediately = e.target.checked;
          }}
        />
        Say Immediately
      </label>
    </div>
  );
};

/**
 * Full page component for Current Word page
 */
interface CurrentWordPageProps { appState: AppState; }

export const CurrentWordPage: React.FC<CurrentWordPageProps> = ({ appState }) => {
  return (
    <>
      <CurrentWordAppControls appState={appState} />
      <CurrentWordView currentWord={appState.currentWord} maxWordLength={appState.wordGraph.maxWordLength} />
      <CompactHistoryView history={appState.history} />
    </>
  );
};
