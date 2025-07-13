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

  const isCorrectWord = backgroundClass.includes('correct');
  const hasWord = word !== null;

  return (
    <Panel
      visible={false}
      left={true}
      inspectorTitle="MakeNextWordPanel"
    >
      <Help title={hasWord ? (isCorrectWord ? "Correct Word!" : "Result Word") : "Next Word Area"}>{`
        ${hasWord
          ? isCorrectWord
            ? "🎉 Congratulations! You've built a correct word. This word will be added to your collection. You can delete it using the ✕ button if needed, or start building a new word."
            : "This is the word you've created. If it's not a recognized word, you can try building a different word. Use the ✕ button to delete this result, or start building a new word."
          : "This area will show the result when you finish building a word. Keep adding letters to your current word above to see the result appear here."
        }`}
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
