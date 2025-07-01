import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordChoiceFinder } from '@/models/finders/word-choice-finder/word-choice-finder';
import { ActionButton } from '@/lib/views/action-button';

interface FinderControlsProps { finder: WordChoiceFinder; }

export const FinderControls: React.FC<FinderControlsProps> = observer(({ finder }) => {
  return (
    <div className="word-changer-controls">
      <ActionButton action={finder.retryAction}>Retry</ActionButton>
      <ActionButton action={finder.newAction}>New</ActionButton>
    </div>
  );
});
