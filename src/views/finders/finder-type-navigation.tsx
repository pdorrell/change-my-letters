import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { Finders } from '@/models/finders/finders';

interface FinderTypeNavigationProps { finders: Finders; }

export const FinderTypeNavigation: React.FC<FinderTypeNavigationProps> = observer(({ finders }) => {
  return (
    <div className="page-navigation-tabs">
      {finders.allFinderTypes.map(({ finderType, shortLabel, isActive }) => (
        <button
          key={finderType}
          className={clsx('page-tab', { active: isActive })}
          onClick={isActive ? undefined : () => finders.setFinderType(finderType)}
          title={`Switch to ${shortLabel} finder`}
          disabled={isActive}
        >
          {shortLabel}
        </button>
      ))}
    </div>
  );
});
