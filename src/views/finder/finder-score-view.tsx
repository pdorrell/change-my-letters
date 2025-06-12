import React from 'react';
import { observer } from 'mobx-react-lite';
import { FinderInteraction } from '@/models/finder/finder-interaction';

interface FinderScoreViewProps { finderInteraction: FinderInteraction; }

export const FinderScoreView: React.FC<FinderScoreViewProps> = observer(({ finderInteraction }) => {
  return (
    <div className="finder-score">
      {finderInteraction.scoreText}
    </div>
  );
});
