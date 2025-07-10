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
  return (
    <button
      onClick={() => model.toggle()}
      title={model.currentTooltip}
      className={className}
      style={{
        background: model.value ? activeColor : 'white',
        color: 'black',
        padding: '0.1em 0.1em',
        borderRadius: '0.2em',
        border: '1px solid #ccc',
        fontSize: '1.1em',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '1em',
        ...style
      }}
    >
      {label}
    </button>
  );
});