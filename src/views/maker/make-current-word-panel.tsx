import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { range } from '@/lib/util';
import { LetterView, LetterPlaceholder } from '@/views/Letter';
import { PositionView, PositionPlaceholder } from '@/views/Position';
import { ActionButton } from '@/lib/views/action-button';
import { ButtonAction } from '@/lib/models/actions';
import { MakerCurrentWord } from '@/models/maker/maker-current-word';
import { Panel } from '@/lib/views/panel';
import { Help } from '@/lib/components/help';

interface MakeCurrentWordPanelProps {
  wordInteraction: MakerCurrentWord;
  maxWordLength: number;
  newWordAction: ButtonAction;
}

export const MakeCurrentWordPanel: React.FC<MakeCurrentWordPanelProps> = observer(({
  wordInteraction,
  maxWordLength,
  newWordAction
}) => {
  // Add a document-wide click handler to close menus when clicking outside
  React.useEffect(() => {
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
    // Use the word interaction's position interactions
    const positionInteraction = index < wordInteraction.wordInteraction.positionInteractions.length ?
      wordInteraction.wordInteraction.positionInteractions[index] : null;
    return positionInteraction ? <PositionView positionInteraction={positionInteraction} /> : <PositionPlaceholder/>;
  }

  function getLetterView(index: number): React.ReactElement {
    // Use the word interaction's letter interactions
    const letterInteraction = index < wordInteraction.wordInteraction.letterInteractions.length ?
      wordInteraction.wordInteraction.letterInteractions[index] : null;
    return letterInteraction ? <LetterView letterInteraction={letterInteraction} /> : <LetterPlaceholder/>;
  }

  return (
    <Panel
      visible={false}
      left={true}
      inspectorTitle="MakeCurrentWordPanel"
    >
      <Help title="Maker Current">{`
      * Word display:
        * Click on a letter to replace or delete
        * Click on '+' to insert a new letter
      * **New Word** Click to hear the new word that you have to make`}
      </Help>
      <div className="make-word-row">
        <div className={clsx('word-display', 'touch-interactive-area', wordInteraction.backgroundClass)}>
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
        <div className="make-word-controls">
          <ActionButton action={newWordAction} className="make-new-word-button">New Word</ActionButton>
        </div>
      </div>
    </Panel>
  );
});
