import React from 'react';
import { observer } from 'mobx-react-lite';
import { range } from '@/lib/util';
import { PositionInteraction } from '@/models/interaction/position-interaction';
import { WordInteraction } from '@/models/interaction/word-interaction';
import { LetterView, LetterPlaceholder } from '@/views/Letter';
import { PositionView, PositionPlaceholder } from '@/views/Position';
import { MenuManagerInterface } from '@/lib/views/menu-manager-interface';
import { AppState } from '@/models/app-state';
import { ActionButton } from '@/lib/views/action-button';
import { HistoryPanel } from '@/views/History';
import { ScorePanel } from '@/lib/views/score-panel';
import { ValueCheckbox } from '@/lib/views/value-model-views';
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
 * View component for displaying the word changer
 */
interface WordChangerViewProps { wordChanger: WordInteraction; maxWordLength?: number; }

export const WordChangerView: React.FC<WordChangerViewProps> = observer(({ wordChanger, maxWordLength }) => {

  // Add a document-wide click handler to close menus when clicking outside
  React.useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Check if there are any open menus by examining the interactions
      const hasOpenMenus = wordChanger.letterInteractions.some(li => li.isReplaceMenuOpen) ||
                          wordChanger.positionInteractions.some(pi => pi.isInsertMenuOpen);

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
            target.classList.contains('insert-icon') ||
            target.classList.contains('letter-text') ||
            (target.classList.contains('letter') && target.classList.contains('clickable'));
        }

        if (!menuClick) {
          wordChanger.menuManager.closeMenus();
        }
      }
    };

    // Add the click handler to document
    document.addEventListener('click', handleGlobalClick);

    // Clean up on component unmount
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [wordChanger.menuManager]);

  // Get maximum word length
  const getMaxWordLength = (): number => {
    return maxWordLength || 5; // Use provided maxWordLength or fallback to 5
  };

  // Get the maximum word length
  const maxLength = getMaxWordLength();

  function getPositionView(index : number): React.ReactElement {
    const positionInteraction: PositionInteraction | null = wordChanger.getActivePositionInteraction(index);
    return positionInteraction ? <PositionView positionInteraction={positionInteraction} /> : <PositionPlaceholder/>;
  }

  function getLetterView(index : number): React.ReactElement {
    const letterInteraction = wordChanger.getActiveLetterInteraction(index);
    return letterInteraction ? <LetterView letterInteraction={letterInteraction} /> : <LetterPlaceholder/>;
  }

  return (
    <div
      className={`word-outer-container ${wordChanger.word.previouslyVisited ? 'previously-visited' : ''}`}
    >
      <div className="word-changer-container">
        <div className="word-display">
          {/* Render alternating sequence of positions and letters for the word changer */}
          { range(maxLength).map(index => (
            <React.Fragment key={`position--${index}`}>
              { getPositionView(index) }
              { getLetterView(index) }
            </React.Fragment>
          ))}
          <PositionPlaceholder/>
        </div>
      </div>
    </div>
  );
});

/**
 * View component for the letter choice menu
 */
import { WordSelectionByLetter } from '@/models/word-selection-by-letter';
import { ButtonAction } from '@/lib/models/actions';

interface LetterChoiceMenuProps {
  wordSelectionByLetter: WordSelectionByLetter;
  menuManager: MenuManagerInterface;
  menuRef?: React.RefObject<HTMLDivElement>;
  deleteAction?: ButtonAction;
}

export const LetterChoiceMenu: React.FC<LetterChoiceMenuProps> = observer(({ wordSelectionByLetter, menuManager, menuRef, deleteAction }) => {
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
          {deleteAction && (
            <div
              key="delete-option"
              className="letter-choice-option delete-option"
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
});

/**
 * Controls component for word changer page
 */
interface WordChangerControlsProps { appState: AppState; }

export const WordChangerControls: React.FC<WordChangerControlsProps> = observer(({ appState }) => {
  return (
    <div className="word-changer-controls">
      <ActionButton action={appState.undoAction}>Undo</ActionButton>
      <ActionButton action={appState.redoAction}>Redo</ActionButton>
      <ActionButton action={appState.sayAction}>Say</ActionButton>
      <ActionButton
        action={appState.makeMeButtonAction}
        className={appState.makeMeWord ? 'make-me-active' : ''}
      >
        Make Me
      </ActionButton>
      <ValueCheckbox value={appState.sayImmediately} />
    </div>
  );
});

/**
 * Full page component for word changer page
 */
interface WordChangerPageProps { appState: AppState; }

export const WordChangerPage: React.FC<WordChangerPageProps> = observer(({ appState }) => {
  return (
    <>
      <WordChangerControls appState={appState} />
      <WordChangerView wordChanger={appState.wordChanger} maxWordLength={appState.wordGraph.maxWordLength} />
      <ScorePanel scoreModel={appState.makeMeScore} />
      <HistoryPanel history={appState.history} />
    </>
  );
});
