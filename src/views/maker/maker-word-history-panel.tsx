import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { Word } from '@/models/Word';
import { range } from '@/lib/util';
import { LetterPlaceholder } from '@/views/Letter';
import { PositionPlaceholder } from '@/views/Position';
import { Panel } from '@/lib/views/panel';
import { Help } from '@/lib/components/help';

interface MakerWordHistoryPanelProps {
  word: Word;
  maxWordLength: number;
  showHelp: boolean;
}

export const MakerWordHistoryPanel: React.FC<MakerWordHistoryPanelProps> = observer(({
  word,
  maxWordLength,
  showHelp
}) => {
  function getLetterView(index: number): React.ReactElement {
    // For history words, show static letters with proper styling
    const letter = word.letters[index];
    return letter ? (
      <div className="letter-container">
        <div className={clsx('letter', 'static')}>
          <span className="letter-text">{letter.value}</span>
        </div>
      </div>
    ) : <LetterPlaceholder/>;
  }

  return (
    <Panel
      visible={false}
      left={true}
      inspectorTitle="MakerWordHistoryPanel"
    >
      {showHelp && (
        <Help title="Word History">{`
          These are words you've completed building. They show your building progress and you can reference them as you continue building new words. The most recent completed word appears at the bottom of the history.`}
        </Help>
      )}
      <div className="make-word-row">
        <div className={clsx('word-display', 'touch-interactive-area')}>
          {/* Render alternating sequence of positions and letters */}
          {range(maxWordLength).map(index => (
            <React.Fragment key={`position--${index}`}>
              <PositionPlaceholder/>
              {getLetterView(index)}
            </React.Fragment>
          ))}
          <PositionPlaceholder/>
        </div>
      </div>
    </Panel>
  );
});
