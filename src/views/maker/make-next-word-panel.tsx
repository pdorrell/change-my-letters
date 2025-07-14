import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { Word } from '@/models/Word';
import { range } from '@/lib/util';
import { LetterPlaceholder } from '@/views/Letter';
import { PositionPlaceholder } from '@/views/Position';
import { ButtonAction } from '@/lib/models/actions';
import { Panel } from '@/lib/views/panel';
import { Help } from '@/lib/components/help';

interface MakeNextWordPanelProps {
  word: Word | null;
  maxWordLength: number;
  backgroundClass: string;
  showDeleteButton: boolean;
  deleteAction?: ButtonAction;
}

export const MakeNextWordPanel: React.FC<MakeNextWordPanelProps> = observer(({
  word,
  maxWordLength,
  backgroundClass,
  showDeleteButton,
  deleteAction
}) => {
  function getLetterView(index: number): React.ReactElement {
    if (word) {
      // For result words, show static letters with proper styling
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
    <Panel
      visible={false}
      left={true}
      inspectorTitle="MakeNextWordPanel"
    >
      <Help title={"Result Word"}>{`
      * The word resulting from changing the current word:
        - if correct: appears in green and then the current word advances to be the result word
      - if incorrect: appears in pink with a "X" button (press X to delete the incorrect word and try again)`}
      </Help>
      <div className="make-word-row">
        <div className={clsx('word-display', 'touch-interactive-area', backgroundClass)}>
          {/* Render alternating sequence of positions and letters */}
          {range(maxWordLength).map(index => (
            <React.Fragment key={`position--${index}`}>
              <PositionPlaceholder/>
              {getLetterView(index)}
            </React.Fragment>
          ))}
          <PositionPlaceholder/>
        </div>

        {/* Controls */}
        {showDeleteButton && deleteAction && (
          <div className="make-word-controls">
            <button
              onClick={deleteAction.enabled ? () => deleteAction.doAction() : undefined}
              disabled={!deleteAction.enabled}
              className="make-delete-button"
              title={deleteAction.tooltip}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </Panel>
  );
});
