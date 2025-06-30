import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordChoiceFinderInteraction } from '@/models/finders/word-choice-finder/word-choice-finder';
import { FinderScoreView } from './finder-score-view';
import { FinderControls } from './finder-controls';

interface FinderScoreAndControlsPanelProps { finderInteraction: WordChoiceFinderInteraction; }

export const FinderScoreAndControlsPanel: React.FC<FinderScoreAndControlsPanelProps> = observer(({ finderInteraction }) => {
  return (
    <div className="finder-score-and-controls-panel">
      <FinderScoreView finderInteraction={finderInteraction} />
      <FinderControls finderInteraction={finderInteraction} />
    </div>
  );
});
