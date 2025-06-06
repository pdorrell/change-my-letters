import React from 'react';
import { observer } from 'mobx-react-lite';
import { Filter } from '../filter';
import { ValueCheckbox, TextValueInputWithPlaceholder } from './value-model-views';

interface FilterControlsProps { filter: Filter; }

export const FilterControls: React.FC<FilterControlsProps> = observer(({ filter }) => {
  return (
    <div className="filter-controls">
      <TextValueInputWithPlaceholder value={filter.value} />
      <ValueCheckbox value={filter.matchStartOnly} />
    </div>
  );
});

