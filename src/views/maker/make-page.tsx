import React from 'react';
import { observer } from 'mobx-react-lite';
import { MakerInteraction } from '@/models/maker/maker';
import { MakeWordView } from './make-word-view';
import { useScrollOnResize } from '@/hooks/useScrollOnResize';

interface MakePageProps {
  makerInteraction: MakerInteraction;
  maxWordLength: number;
}

export const MakePage: React.FC<MakePageProps> = observer(({ makerInteraction, maxWordLength }) => {
  const { containerRef, bottomElementRef } = useScrollOnResize(20); // 20px margin from bottom

  return (
    <div className="make-page" ref={containerRef}>
      {/* History words */}
      {makerInteraction.history.historyWords.length > 0 && (
        <div className="make-history">
          {makerInteraction.history.historyWords.map((word, index) => (
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
          word={makerInteraction.currentWord.word}
          maxWordLength={maxWordLength}
          backgroundClass={makerInteraction.currentWord.backgroundClass}
          showControls={true}
          wordInteraction={makerInteraction.currentWord}
          newWordAction={makerInteraction.newWordAction}
        />
      </div>

      {/* Result word (always shown) */}
      <div className="make-result-word" ref={bottomElementRef}>
        {makerInteraction.result ? (
          <MakeWordView
            word={makerInteraction.result.word}
            maxWordLength={maxWordLength}
            backgroundClass={makerInteraction.result.backgroundClass}
            showControls={makerInteraction.result.showDeleteButton}
            deleteAction={makerInteraction.deleteResultAction}
          />
        ) : (
          <MakeWordView
            word={null}
            maxWordLength={maxWordLength}
            backgroundClass={makerInteraction.resultDisplay.backgroundClass}
            showControls={false}
          />
        )}
      </div>

    </div>
  );
});
