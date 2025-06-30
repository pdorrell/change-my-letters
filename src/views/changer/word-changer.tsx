import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { range } from '@/lib/util';
import { PositionInteraction } from '@/models/interaction/position-interaction';
import { WordInteraction } from '@/models/interaction/word-interaction';
import { WordChanger } from '@/models/changer/word-changer';
import { LetterView, LetterPlaceholder } from '@/views/Letter';
import { PositionView, PositionPlaceholder } from '@/views/Position';
import { MenuManagerInterface } from '@/lib/views/menu-manager-interface';
import { ActionButton } from '@/lib/views/action-button';
import { HistoryPanel } from './History';
import { ValueCheckbox } from '@/lib/views/value-model-views';
import { Panel } from '@/lib/views/panel';
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
interface WordChangerViewProps { wordInteraction: WordInteraction; maxWordLength?: number; }

export const WordChangerView: React.FC<WordChangerViewProps> = observer(({ wordInteraction, maxWordLength }) => {

  // Add a document-wide click handler to close menus when clicking outside
  React.useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Check if there are any open menus by examining the interactions
      const hasOpenMenus = wordInteraction.letterInteractions.some(li => li.isReplaceMenuOpen) ||
                          wordInteraction.positionInteractions.some(pi => pi.isInsertMenuOpen);

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
          wordInteraction.menuManager.closeMenus();
        }
      }
    };

    // Add the click handler to document
    document.addEventListener('click', handleGlobalClick);

    // Clean up on component unmount
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [wordInteraction.menuManager]);

  // Get maximum word length
  const getMaxWordLength = (): number => {
    return maxWordLength || 5; // Use provided maxWordLength or fallback to 5
  };

  // Get the maximum word length
  const maxLength = getMaxWordLength();

  function getPositionView(index : number): React.ReactElement {
    const positionInteraction: PositionInteraction | null = wordInteraction.getActivePositionInteraction(index);
    return positionInteraction ? <PositionView positionInteraction={positionInteraction} /> : <PositionPlaceholder/>;
  }

  function getLetterView(index : number): React.ReactElement {
    const letterInteraction = wordInteraction.getActiveLetterInteraction(index);
    return letterInteraction ? <LetterView letterInteraction={letterInteraction} /> : <LetterPlaceholder/>;
  }

  return (
    <Panel>
      <div className={clsx('word-display', 'touch-interactive-area', { 'previously-visited': wordInteraction.word.previouslyVisited })}>
        {/* Render alternating sequence of positions and letters for the word changer */}
        { range(maxLength).map(index => (
          <React.Fragment key={`position--${index}`}>
            { getPositionView(index) }
            { getLetterView(index) }
          </React.Fragment>
        ))}
        <PositionPlaceholder/>
      </div>
    </Panel>
  );
});

/**
 * View component for the letter choice menu
 */
import { WordSelectionByLetter } from '@/models/changer/word-selection-by-letter';
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
    </FloatingPortal>
  );
});

/**
 * Controls component for word changer page
 */
interface WordChangerControlsProps { wordChanger: WordChanger; }

export const WordChangerControls: React.FC<WordChangerControlsProps> = observer(({ wordChanger }) => {
  return (
    <div className="word-changer-controls">
      <ActionButton action={wordChanger.undoAction}>Undo</ActionButton>
      <ActionButton action={wordChanger.redoAction}>Redo</ActionButton>
      <ActionButton action={wordChanger.sayAction}>Say</ActionButton>
      <ValueCheckbox value={wordChanger.sayImmediately} />
    </div>
  );
});

/**
 * Full page component for word changer page
 */
interface WordChangerPageProps { wordChanger: WordChanger; maxWordLength: number; }

export const WordChangerPage: React.FC<WordChangerPageProps> = observer(({ wordChanger, maxWordLength }) => {
  return (
    <>
      <WordChangerControls wordChanger={wordChanger} />
      <WordChangerView wordInteraction={wordChanger.wordInteraction} maxWordLength={maxWordLength} />
      <HistoryPanel history={wordChanger.history} />
    </>
  );
});
