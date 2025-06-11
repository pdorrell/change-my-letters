import React from 'react';
import { observer } from 'mobx-react-lite';
import { ValueModel } from '@/lib/models/value-models';

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

/**
 * Text input component for ValueModel<string> with placeholder text
 */
interface TextValueInputWithPlaceholderProps { value: ValueModel<string>; }

export const TextValueInputWithPlaceholder: React.FC<TextValueInputWithPlaceholderProps> = observer(({ value }) => {
  return (
    <input
      type="text"
      placeholder={`${value.label}...`}
      value={value.value}
      onChange={(e) => value.set(e.target.value)}
      title={value.tooltip}
    />
  );
});

/**
 * Radio buttons component for ValueModel<T> where T extends string
 */
interface ValueRadioButtonsProps<T extends string> { value: ValueModel<T>; options: T[]; }

export const ValueRadioButtons = observer(<T extends string>({ value, options }: ValueRadioButtonsProps<T>): React.ReactElement => {
  const groupName = `radio-${value.label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="value-radio-buttons-container" title={value.tooltip}>
      <span className="radio-label">{value.label}</span>
      {options.map((option) => (
        <label key={option} className="radio-option">
          <input
            type="radio"
            name={groupName}
            value={option}
            checked={value.value === option}
            onChange={() => value.set(option)}
          />
          {option}
        </label>
      ))}
    </div>
  );
});
