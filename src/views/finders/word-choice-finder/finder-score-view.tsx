import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordChoiceFinderInteraction } from '@/models/finders/word-choice-finder/word-choice-finder-interaction';

interface FinderScoreViewProps { finderInteraction: WordChoiceFinderInteraction; }

export const FinderScoreView: React.FC<FinderScoreViewProps> = observer(({ finderInteraction }) => {
  return (
    <div className="finder-score">{finderInteraction.scoreText}</div>
  );
});
