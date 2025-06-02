import React from 'react';
import { observer } from 'mobx-react-lite';
import { Filter } from '../filter';
import { ValueCheckbox } from './value-model-views';

interface FilterControlsProps { filter: Filter; }

export const FilterControls: React.FC<FilterControlsProps> = observer(({ filter }) => {
  return (
    <div className="filter-controls">
      <input
        type="text"
        placeholder="Filter text..."
        value={filter.value}
        onChange={(e) => filter.setValue(e.target.value)}
      />
      <ValueCheckbox value={filter.matchStartOnly} />
    </div>
  );
});

