import React from 'react';
import { observer } from 'mobx-react-lite';
import { Filter, FILTER_MATCH_OPTIONS } from '@/lib/models/filter';
import { ValueRadioButtons, TextValueInputWithPlaceholder } from '@/lib/views/value-model-views';
import { Inspectable } from '@/lib/inspector';
import { Helpable, Help } from '@/lib/components/help';

interface FilterControlsProps { filter: Filter; }

export const FilterControls: React.FC<FilterControlsProps> = observer(({ filter }) => {
  return (
    <Inspectable name="FilterControls" lib>
      <Helpable>
        <Help>
          Use these controls to filter the available words. Type in the text box to search for specific letters or patterns. The radio buttons change how the filter works: 'Contains' finds words with your text anywhere inside, 'Starts with' finds words beginning with your text, and 'Length' filters by word length (enter a number).
        </Help>
        <div className="filter-controls">
          <TextValueInputWithPlaceholder value={filter.value} />
          <ValueRadioButtons value={filter.matchOption} options={FILTER_MATCH_OPTIONS} />
        </div>
      </Helpable>
    </Inspectable>
  );
});

