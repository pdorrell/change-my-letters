import React from 'react';
import { observer } from 'mobx-react-lite';
import { WordsInRowFinder } from '@/models/finders/words-in-row-finder/words-in-row-finder';
import { ActionButton } from '@/lib/views/action-button';
import { ValueRadioButtons, ValueCheckbox } from '@/lib/views/value-model-views';
import { DifficultyType } from '@/models/finders/words-in-row-finder/types';

interface FinderControlsProps { finder: WordsInRowFinder; }

export const FinderControls: React.FC<FinderControlsProps> = observer(({ finder }) => {
  const difficultyOptions: DifficultyType[] = ['easy', 'hard'];

  return (
    <div className="word-changer-controls">
      <ValueRadioButtons value={finder.difficulty} options={difficultyOptions} />
      <ValueCheckbox value={finder.forwardsOnly} />
      <div style={{ marginLeft: 'auto' }}>
        <ActionButton action={finder.newAction}>New</ActionButton>
      </div>
    </div>
  );
});
