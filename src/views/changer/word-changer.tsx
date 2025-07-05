import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { range } from '@/lib/util';
import { PositionInteraction } from '@/models/interaction/position';
import { WordInteraction } from '@/models/interaction/word';
import { WordChanger } from '@/models/changer/word-changer';
import { LetterView, LetterPlaceholder } from '@/views/Letter';
import { PositionView, PositionPlaceholder } from '@/views/Position';
import { ActionButton } from '@/lib/views/action-button';
import { HistoryPanel } from './History';
import { ValueCheckbox } from '@/lib/views/value-model-views';
import { Panel } from '@/lib/views/panel';
import { inspectable } from '@/lib/inspector';

/**
 * View component for displaying the word changer
 */
interface WordChangerViewProps { wordInteraction: WordInteraction; maxWordLength?: number; }

const WordChangerViewComponent: React.FC<WordChangerViewProps> = ({ wordInteraction, maxWordLength }) => {

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
};

export const WordChangerView: React.FC<WordChangerViewProps> = observer(
  inspectable('WordChangerView', WordChangerViewComponent)
);


/**
 * Controls component for word changer page
 */
interface WordChangerControlsProps { wordChanger: WordChanger; }

const WordChangerControlsComponent: React.FC<WordChangerControlsProps> = ({ wordChanger }) => {
  return (
    <div className="word-changer-controls">
      <ActionButton action={wordChanger.undoAction}>Undo</ActionButton>
      <ActionButton action={wordChanger.redoAction}>Redo</ActionButton>
      <ActionButton action={wordChanger.sayAction}>Say</ActionButton>
      <ValueCheckbox value={wordChanger.sayImmediately} />
    </div>
  );
};

export const WordChangerControls: React.FC<WordChangerControlsProps> = observer(
  inspectable('WordChangerControls', WordChangerControlsComponent)
);

/**
 * Full page component for word changer page
 */
interface WordChangerPageProps { wordChanger: WordChanger; maxWordLength: number; }

const WordChangerPageComponent: React.FC<WordChangerPageProps> = ({ wordChanger, maxWordLength }) => {
  return (
    <>
      <WordChangerControls wordChanger={wordChanger} />
      <WordChangerView wordInteraction={wordChanger.wordInteraction} maxWordLength={maxWordLength} />
      <HistoryPanel history={wordChanger.history} />
    </>
  );
};

export const WordChangerPage: React.FC<WordChangerPageProps> = observer(
  inspectable('WordChangerPage', WordChangerPageComponent)
);
