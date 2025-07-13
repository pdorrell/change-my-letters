import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordsInRowFinder } from '@/models/finders/words-in-row-finder/words-in-row-finder';
import { ActionButton } from '@/lib/views/action-button';
import { DifficultyType } from '@/models/finders/words-in-row-finder/types';
import { Panel } from '@/lib/views/panel';
import { GroupRight } from '@/lib/views/group-right';
import { Help } from '@/lib/components/help';

interface FinderControlsProps { finder: WordsInRowFinder; }

export const FinderControls: React.FC<FinderControlsProps> = observer(({ finder }) => {
  const difficultyOptions: DifficultyType[] = ['easy', 'hard'];
  const settingsDisabled = !finder.canChangeSettings;

  return (
    <Panel
      visible={true}
      inspectorTitle="FinderControls"
    >
      <Help title="Row Finder Controls">
        * **Difficulty** - easy (words go left-to-right) or hard (words can go in any direction)
        * **Forwards Only** - restrict to left-to-right words only
        * **Auto** - automatically select next word to find
        * **New** - generate a new letter grid with new words
      </Help>
      <div className={clsx('value-radio-buttons-container', { disabled: settingsDisabled })} title={finder.difficulty.tooltip}>
        <span className="radio-label">{finder.difficulty.label}</span>
        {difficultyOptions.map((option) => (
          <label key={option} className="radio-option">
            <input
              type="radio"
              name="difficulty"
              value={option}
              checked={finder.difficulty.value === option}
              disabled={settingsDisabled}
              onChange={() => !settingsDisabled && finder.difficulty.set(option)}
            />
            {option}
          </label>
        ))}
      </div>
      <label className={clsx('value-checkbox-container', { disabled: settingsDisabled })} title={finder.forwardsOnly.tooltip}>
        <input
          type="checkbox"
          checked={finder.forwardsOnly.value}
          disabled={settingsDisabled}
          onChange={(e) => !settingsDisabled && finder.forwardsOnly.set(e.target.checked)}
        />
        {finder.forwardsOnly.label}
      </label>
      <label className="value-checkbox-container" title={finder.auto.tooltip}>
        <input
          type="checkbox"
          checked={finder.auto.value}
          onChange={(e) => finder.auto.set(e.target.checked)}
        />
        {finder.auto.label}
      </label>
      <GroupRight>
        <ActionButton action={finder.newAction}>New</ActionButton>
      </GroupRight>
    </Panel>
  );
});
