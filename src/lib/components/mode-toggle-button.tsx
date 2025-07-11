import React from 'react';
import { observer } from 'mobx-react-lite';
import { ToggleModel } from '@/lib/models/toggle-model';

interface ModeToggleButtonProps {
  model: ToggleModel;
  label: string;
  activeColor: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ModeToggleButton: React.FC<ModeToggleButtonProps> = observer(({
  model,
  label,
  activeColor,
  className,
  style
}) => {
  const baseClasses = 'mode';
  const statusClass = model.value ? 'on' : 'off';
  const allClasses = `${baseClasses} ${className || ''} ${statusClass}`.trim();
  
  return (
    <button
      onClick={() => model.toggle()}
      title={model.currentTooltip}
      className={allClasses}
      style={style}
    >
      {label}
    </button>
  );
});
