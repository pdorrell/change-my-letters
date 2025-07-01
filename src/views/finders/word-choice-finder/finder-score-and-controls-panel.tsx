import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordChoiceFinder } from '@/models/finders/word-choice-finder/word-choice-finder';
import { FinderScoreView } from './finder-score-view';
import { FinderControls } from './finder-controls';

interface FinderScoreAndControlsPanelProps { finder: WordChoiceFinder; }

export const FinderScoreAndControlsPanel: React.FC<FinderScoreAndControlsPanelProps> = observer(({ finder }) => {
  return (
    <div className="finder-score-and-controls-panel">
      <FinderScoreView finder={finder} />
      <FinderControls finder={finder} />
    </div>
  );
});
