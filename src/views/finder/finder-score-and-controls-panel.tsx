import React from 'react';
import { observer } from 'mobx-react-lite';
import { FinderInteraction } from '@/models/finder/finder-interaction';
import { FinderScoreView } from '@/views/finder/finder-score-view';
import { FinderControls } from '@/views/finder/finder-controls';

interface FinderScoreAndControlsPanelProps { finderInteraction: FinderInteraction; }

export const FinderScoreAndControlsPanel: React.FC<FinderScoreAndControlsPanelProps> = observer(({ finderInteraction }) => {
  return (
    <div className="finder-score-and-controls-panel">
      <FinderScoreView finderInteraction={finderInteraction} />
      <FinderControls finderInteraction={finderInteraction} />
    </div>
  );
});
