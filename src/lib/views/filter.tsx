import React from 'react';
import { observer } from 'mobx-react-lite';
import { Filter } from '../filter';

interface FilterViewProps { filter: Filter; }

export const FilterView: React.FC<FilterViewProps> = observer(({ filter }) => {
  return (
    <div className="filter-view">
      <input
        type="text"
        placeholder="Filter text..."
        value={filter.value}
        onChange={(e) => filter.setValue(e.target.value)}
      />
      <label className="match-start-checkbox">
        <input
          type="checkbox"
          checked={filter.matchStartOnly}
          onChange={(e) => filter.setMatchStartOnly(e.target.checked)}
        />
        Match start only
      </label>
    </div>
  );
});

