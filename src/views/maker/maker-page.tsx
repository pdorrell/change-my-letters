import React from 'react';
import { observer } from 'mobx-react-lite';
import { Maker } from '@/models/maker/maker';
import { MakerWordHistoryPanel } from './maker-word-history-panel';
import { MakeCurrentWordPanel } from './make-current-word-panel';
import { MakeNextWordPanel } from './make-next-word-panel';
import { useScrollOnResize } from '@/hooks/useScrollOnResize';
import { Page } from '@/lib/views/page';
import { Inspectable } from '@/lib/inspector';

interface MakerPageProps {
  maker: Maker;
  maxWordLength: number;
}

export const MakerPage: React.FC<MakerPageProps> = observer(({ maker, maxWordLength }) => {
  const { containerRef, bottomElementRef } = useScrollOnResize(20); // 20px margin from bottom

  return (
    <Inspectable name="MakerPage">
      <Page>
        <div className="make-page" ref={containerRef}>
        {/* History words */}
        {maker.history.historyWords.length > 0 && (
          <div className="make-history">
            {maker.history.historyWords.map((word, index) => (
              <MakerWordHistoryPanel
                key={`history-${index}`}
                word={word}
                maxWordLength={maxWordLength}
                showHelp={index === 0}
              />
            ))}
          </div>
        )}

        {/* Current word */}
        <div className="make-current-word">
          <MakeCurrentWordPanel
            wordInteraction={maker.currentWord}
            maxWordLength={maxWordLength}
            newWordAction={maker.newWordAction}
          />
        </div>

        {/* Result word (always shown) */}
        <div className="make-result-word" ref={bottomElementRef}>
          <MakeNextWordPanel
            word={maker.result?.word || null}
            maxWordLength={maxWordLength}
            backgroundClass={maker.result?.backgroundClass || maker.resultDisplay.backgroundClass}
            showDeleteButton={maker.result?.showDeleteButton || false}
            deleteAction={maker.deleteResultAction}
          />
        </div>

      </div>
      </Page>
    </Inspectable>
  );
});
