import React from 'react';
import { observer } from 'mobx-react-lite';
import { Maker } from '@/models/maker/maker';
import { MakeWordView } from './make-word-view';
import { useScrollOnResize } from '@/hooks/useScrollOnResize';

interface MakerPageProps {
  maker: Maker;
  maxWordLength: number;
}

export const MakerPage: React.FC<MakerPageProps> = observer(({ maker, maxWordLength }) => {
  const { containerRef, bottomElementRef } = useScrollOnResize(20); // 20px margin from bottom

  return (
    <div className="make-page" ref={containerRef}>
      {/* History words */}
      {maker.history.historyWords.length > 0 && (
        <div className="make-history">
          {maker.history.historyWords.map((word, index) => (
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
          word={maker.currentWord.word}
          maxWordLength={maxWordLength}
          backgroundClass={maker.currentWord.backgroundClass}
          showControls={true}
          wordInteraction={maker.currentWord}
          newWordAction={maker.newWordAction}
        />
      </div>

      {/* Result word (always shown) */}
      <div className="make-result-word" ref={bottomElementRef}>
        {maker.result ? (
          <MakeWordView
            word={maker.result.word}
            maxWordLength={maxWordLength}
            backgroundClass={maker.result.backgroundClass}
            showControls={maker.result.showDeleteButton}
            deleteAction={maker.deleteResultAction}
          />
        ) : (
          <MakeWordView
            word={null}
            maxWordLength={maxWordLength}
            backgroundClass={maker.resultDisplay.backgroundClass}
            showControls={false}
          />
        )}
      </div>

    </div>
  );
});
