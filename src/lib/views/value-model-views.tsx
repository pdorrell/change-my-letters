import React from 'react';
import { observer } from 'mobx-react-lite';
import { ValueModel } from '../models/value-models';

/**
 * Checkbox component for ValueModel<boolean>
 */
interface ValueCheckboxProps { value: ValueModel<boolean>; }

export const ValueCheckbox: React.FC<ValueCheckboxProps> = observer(({ value }) => {
  return (
    <label className="value-checkbox-container" title={value.tooltip}>
      <input
        type="checkbox"
        checked={value.value}
        onChange={(e) => value.set(e.target.checked)}
      />
      {value.label}
    </label>
  );
});
