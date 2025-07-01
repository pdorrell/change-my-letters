import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

interface PronunciationTypeNavigationProps {
  pronunciationType: 'activity' | 'review';
  onTypeChange: (type: 'activity' | 'review') => void;
}

export const PronunciationTypeNavigation: React.FC<PronunciationTypeNavigationProps> = observer(({
  pronunciationType,
  onTypeChange
}) => {
  const pronunciationTypes = [
    { type: 'activity' as const, label: 'Activity', tooltip: 'Switch to Activity mode' },
    { type: 'review' as const, label: 'Review', tooltip: 'Switch to Review mode' }
  ];

  return (
    <div className="page-navigation-tabs">
      {pronunciationTypes.map(({ type, label, tooltip }) => {
        const isActive = pronunciationType === type;
        return (
          <button
            key={type}
            className={clsx('page-tab', { active: isActive })}
            onClick={isActive ? undefined : () => onTypeChange(type)}
            title={tooltip}
            disabled={isActive}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
});
