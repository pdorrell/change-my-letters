import React from 'react';
import { observer } from 'mobx-react-lite';
import { FinderInteraction } from '@/models/finder/finder-interaction';

interface FinderMessagePanelProps { finderInteraction: FinderInteraction; }

export const FinderMessagePanel: React.FC<FinderMessagePanelProps> = observer(({ finderInteraction }) => {
  return (
    <div className="finder-message-panel">
      <div className="finder-message">
        {finderInteraction.message || '\u00A0'}
      </div>
    </div>
  );
});
