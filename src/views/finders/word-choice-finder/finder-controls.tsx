import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordChoiceFinderInteraction } from '@/models/finders/word-choice-finder/word-choice-finder-interaction';
import { ActionButton } from '@/lib/views/action-button';

interface FinderControlsProps { finderInteraction: WordChoiceFinderInteraction; }

export const FinderControls: React.FC<FinderControlsProps> = observer(({ finderInteraction }) => {
  return (
    <div className="word-changer-controls">
      <ActionButton action={finderInteraction.retryAction}>
        Retry
      </ActionButton>
      <ActionButton action={finderInteraction.newAction}>
        New
      </ActionButton>
    </div>
  );
});
