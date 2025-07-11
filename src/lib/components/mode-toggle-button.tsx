import React from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { ToggleModel } from '@/lib/models/toggle-model';

interface ModeToggleButtonProps {
  model: ToggleModel;
  label: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ModeToggleButton: React.FC<ModeToggleButtonProps> = observer(({
  model,
  label,
  className,
  style
}) => {
  return (
    <button
      onClick={() => model.toggle()}
      title={model.currentTooltip}
      className={clsx('mode', className, {
        'on': model.value,
        'off': !model.value
      })}
      style={style}
    >
      {label}
    </button>
  );
});
