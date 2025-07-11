import React from 'react';
import { observer } from 'mobx-react-lite';
import { Filter, FILTER_MATCH_OPTIONS } from '@/lib/models/filter';
import { ValueRadioButtons, TextValueInputWithPlaceholder } from '@/lib/views/value-model-views';
import { Inspectable } from '@/lib/inspector';
import { Help } from '@/lib/components/help';

interface FilterControlsProps { filter: Filter; }

export const FilterControls: React.FC<FilterControlsProps> = observer(({ filter }) => {
  return (
    <Inspectable name="FilterControls" lib>
      <div className="filter-controls">
        <Help title="Filter Controls">
          Use these controls to filter the available words. Type in the text box to search for specific letters or patterns. The radio buttons change how the filter works: 'Contains' finds words with your text anywhere inside, 'Starts with' finds words beginning with your text, and 'Length' filters by word length (enter a number).
        </Help>
        <TextValueInputWithPlaceholder value={filter.value} />
        <ValueRadioButtons value={filter.matchOption} options={FILTER_MATCH_OPTIONS} />
      </div>
    </Inspectable>
  );
});

