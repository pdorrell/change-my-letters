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
          {`
          * **Filter text** sub-string to match against word
          * **Match:**
            * **start** match sub-string to start of word
            * **end** match sub-string to end of word
            * **any** match sub-string anywhere in word
          * **Auto** move on to next word after saying selected word
`}
        </Help>
        <TextValueInputWithPlaceholder value={filter.value} />
        <ValueRadioButtons value={filter.matchOption} options={FILTER_MATCH_OPTIONS} />
      </div>
    </Inspectable>
  );
});

