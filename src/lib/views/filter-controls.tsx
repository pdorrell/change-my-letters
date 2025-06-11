import React from 'react';
import { observer } from 'mobx-react-lite';
import { Filter, FILTER_MATCH_OPTIONS } from '@/lib/filter';
import { ValueRadioButtons, TextValueInputWithPlaceholder } from '@/lib/views/value-model-views';

interface FilterControlsProps { filter: Filter; }


export const FilterControls: React.FC<FilterControlsProps> = observer(({ filter }) => {
  return (
    <div className="filter-controls">
      <TextValueInputWithPlaceholder value={filter.value} />
      <ValueRadioButtons value={filter.matchOption} options={FILTER_MATCH_OPTIONS} />
    </div>
  );
});

