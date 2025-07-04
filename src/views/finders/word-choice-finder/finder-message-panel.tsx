import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordChoiceFinder } from '@/models/finders/word-choice-finder/word-choice-finder';

interface FinderMessagePanelProps { finder: WordChoiceFinder; }

export const FinderMessagePanel: React.FC<FinderMessagePanelProps> = observer(({ finder }) => {
  return (
    <div className="finder-message-panel">
      <div className="finder-message">{finder.message || '\u00A0'}</div>
    </div>
  );
});
