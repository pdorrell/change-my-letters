import React from 'react';
import { observer } from 'mobx-react-lite';
import { Filter, FILTER_MATCH_OPTIONS } from '@/lib/models/filter';
import { ValueRadioButtons, TextValueInputWithPlaceholder } from '@/lib/views/value-model-views';
import { Inspectable } from '@/lib/inspector';

interface FilterControlsProps { filter: Filter; }

export const FilterControls: React.FC<FilterControlsProps> = observer(({ filter }) => {
  return (
    <Inspectable name="FilterControls" lib>
      <div className="filter-controls">
        <TextValueInputWithPlaceholder value={filter.value} />
        <ValueRadioButtons value={filter.matchOption} options={FILTER_MATCH_OPTIONS} />
      </div>
    </Inspectable>
  );
});

