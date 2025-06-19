import React from 'react';
import { observer } from 'mobx-react-lite';
import { MakeInteraction } from '@/models/make/make-interaction';
import { MakeWordView } from './make-word-view';
import { useScrollOnResize } from '@/hooks/useScrollOnResize';

interface MakePageProps {
  makeInteraction: MakeInteraction;
  maxWordLength: number;
}

export const MakePage: React.FC<MakePageProps> = observer(({ makeInteraction, maxWordLength }) => {
  const { containerRef, bottomElementRef } = useScrollOnResize(20); // 20px margin from bottom
  
  return (
    <div className="make-page" ref={containerRef}>
      {/* History words */}
      {makeInteraction.history.historyWords.length > 0 && (
        <div className="make-history">
          {makeInteraction.history.historyWords.map((word, index) => (
            <MakeWordView
              key={`history-${index}`}
              word={word}
              maxWordLength={maxWordLength}
              backgroundClass=""
              showControls={false}
            />
          ))}
        </div>
      )}

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

      {/* Result word (always shown) */}
      <div className="make-result-word" ref={bottomElementRef}>
        {makeInteraction.result ? (
          <MakeWordView
            word={makeInteraction.result.word}
            maxWordLength={maxWordLength}
            backgroundClass={makeInteraction.result.backgroundClass}
            showControls={makeInteraction.result.showDeleteButton}
            deleteAction={makeInteraction.deleteResultAction}
          />
        ) : (
          <MakeWordView
            word={null}
            maxWordLength={maxWordLength}
            backgroundClass={makeInteraction.resultDisplay.backgroundClass}
            showControls={false}
          />
        )}
      </div>

    </div>
  );
});
