import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordChoiceFinderInteraction } from '@/models/finders/word-choice-finder/word-choice-finder';

interface FinderMessagePanelProps { finderInteraction: WordChoiceFinderInteraction; }

export const FinderMessagePanel: React.FC<FinderMessagePanelProps> = observer(({ finderInteraction }) => {
  return (
    <div className="finder-message-panel">
      <div className="finder-message">{finderInteraction.message || '\u00A0'}</div>
    </div>
  );
});
