import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordChoiceFinder } from '@/models/finders/word-choice-finder/word-choice-finder';
import { FinderScoreView } from './finder-score-view';
import { FinderControls } from './finder-controls';
import { Panel } from '@/lib/views/panel';
import { GroupRight } from '@/lib/views/group-right';
import { Help } from '@/lib/components/help';

interface FinderScoreAndControlsProps { finder: WordChoiceFinder; }

export const FinderScoreAndControls: React.FC<FinderScoreAndControlsProps> = observer(({ finder }) => {
  return (
    <Panel
      visible={true}
      inspectorTitle="FinderScoreAndControls"
    >
      <Help title="Score & Controls">{`
        * **Score** - shows your correct/total attempts
        * **Retry** - start over with the same words
        * **New** - get a new set of words to find`}
      </Help>
      <FinderScoreView finder={finder} />
      <GroupRight>
        <FinderControls finder={finder} />
      </GroupRight>
    </Panel>
  );
});
