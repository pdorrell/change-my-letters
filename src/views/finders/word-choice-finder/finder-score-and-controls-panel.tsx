import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordChoiceFinder } from '@/models/finders/word-choice-finder/word-choice-finder';
import { FinderScoreView } from './finder-score-view';
import { FinderControls } from './finder-controls';
import { Panel } from '@/lib/views/panel';

interface FinderScoreAndControlsPanelProps { finder: WordChoiceFinder; }

export const FinderScoreAndControlsPanel: React.FC<FinderScoreAndControlsPanelProps> = observer(({ finder }) => {
  return (
    <Panel 
      visible={true} 
      inspectorTitle="FinderScoreAndControlsPanel"
      helpTitle="Score & Controls"
      helpContent="* **Score** - shows your correct/total attempts\n* **Retry** - start over with the same words\n* **New** - get a new set of words to find"
    >
      <div className="finder-score-and-controls-panel">
        <FinderScoreView finder={finder} />
        <FinderControls finder={finder} />
      </div>
    </Panel>
  );
});
