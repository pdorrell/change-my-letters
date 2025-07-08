import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { WordsInGridFinder } from '@/models/finders/words-in-grid-finder/words-in-grid-finder';
import { ActionButton } from '@/lib/views/action-button';
import { DifficultyType } from '@/models/finders/words-in-grid-finder/types';
import { Inspectable } from '@/lib/inspector';

interface FinderControlsProps { 
  finder: WordsInGridFinder; 
}

export const FinderControls: React.FC<FinderControlsProps> = observer(({ finder }) => {
  const difficultyOptions: DifficultyType[] = ['easy', 'hard'];
  const settingsDisabled = !finder.canChangeSettings;

  return (
    <Inspectable name="FinderControls">
      <div className="word-changer-controls">
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
        <div style={{ marginLeft: 'auto' }}>
          <ActionButton action={finder.newAction}>New</ActionButton>
        </div>
      </div>
    </Inspectable>
  );
});