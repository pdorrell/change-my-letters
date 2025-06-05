import React from 'react';
import { observer } from 'mobx-react-lite';
import { FinderInteraction } from '../models/finder-interaction';
import { ActionButton } from '../lib/views/action-button';

interface FinderControlsProps { finderInteraction: FinderInteraction; }

export const FinderControls: React.FC<FinderControlsProps> = observer(({ finderInteraction }) => {
  return (
    <div className="current-word-controls">
      <ActionButton action={finderInteraction.retryAction}>
        Retry
      </ActionButton>
      <ActionButton action={finderInteraction.newAction}>
        New
      </ActionButton>
    </div>
  );
});
