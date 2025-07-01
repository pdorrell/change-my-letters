import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordChoiceFinder } from '@/models/finders/word-choice-finder/word-choice-finder';

interface FinderScoreViewProps { finderInteraction: WordChoiceFinder; }

export const FinderScoreView: React.FC<FinderScoreViewProps> = observer(({ finderInteraction }) => {
  return (
    <div className="finder-score">{finderInteraction.scoreText}</div>
  );
});
