import React from 'react';
import { observer } from 'mobx-react-lite';
import { MakeInteraction } from '@/models/make/make-interaction';
import { ActionButton } from '@/lib/views/action-button';
import { MakeWordView } from './make-word-view';

interface MakePageProps {
  makeInteraction: MakeInteraction;
  maxWordLength: number;
}

export const MakePage: React.FC<MakePageProps> = observer(({ makeInteraction, maxWordLength }) => {
  return (
    <div className="make-page">
      {/* History words */}
      <div className="make-history">
        {makeInteraction.history.historyWords.map((word, index) => (
          <MakeWordView
            key={`history-${index}`}
            word={word}
            maxWordLength={maxWordLength}
            backgroundClass="bg-gray-100"
            showControls={false}
          />
        ))}
      </div>

      {/* Current word */}
      <div className="make-current-word">
        <MakeWordView
          word={makeInteraction.currentWord.word}
          maxWordLength={maxWordLength}
          backgroundClass={makeInteraction.currentWord.backgroundClass}
          showControls={true}
          wordInteraction={makeInteraction.currentWord}
          newWordAction={makeInteraction.newWordAction}
        />
      </div>

      {/* Result word (if exists) */}
      {makeInteraction.result && (
        <div className="make-result-word">
          <MakeWordView
            word={makeInteraction.result.word}
            maxWordLength={maxWordLength}
            backgroundClass={makeInteraction.result.backgroundClass}
            showControls={makeInteraction.result.showDeleteButton}
            deleteAction={makeInteraction.deleteResultAction}
          />
        </div>
      )}

      {/* Reset button panel */}
      <div className="make-reset-panel">
        <ActionButton action={makeInteraction.resetAction}>Reset</ActionButton>
      </div>
    </div>
  );
});
