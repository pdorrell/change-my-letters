import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordChoiceFinder } from '@/models/finders/word-choice-finder/word-choice-finder';

interface FinderScoreViewProps { finder: WordChoiceFinder; }

export const FinderScoreView: React.FC<FinderScoreViewProps> = observer(({ finder }) => {
  return (
    <div className="finder-score">{finder.scoreText}</div>
  );
});
