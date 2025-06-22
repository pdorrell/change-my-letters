import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { FindersInteraction } from '@/models/finders/finders-interaction';

interface FinderTypeNavigationProps { findersInteraction: FindersInteraction; }

export const FinderTypeNavigation: React.FC<FinderTypeNavigationProps> = observer(({ findersInteraction }) => {
  return (
    <div className="page-navigation-tabs">
      {findersInteraction.allFinderTypes.map(({ finderType, shortLabel, isActive }) => (
        <button
          key={finderType}
          className={clsx('page-tab', { active: isActive })}
          onClick={isActive ? undefined : () => findersInteraction.setFinderType(finderType)}
          title={`Switch to ${shortLabel} finder`}
          disabled={isActive}
        >
          {shortLabel}
        </button>
      ))}
    </div>
  );
});
