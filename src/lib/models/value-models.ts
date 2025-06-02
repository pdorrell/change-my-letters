import { makeAutoObservable } from 'mobx';

/**
 * Generic model for a value that can be updated through UI components
 */
export class ValueModel<T> {
  tooltip: string;
  label: string;
  value: T;

  constructor(initialValue: T, label: string, tooltip: string = '') {
    this.value = initialValue;
    this.label = label;
    this.tooltip = tooltip;

    makeAutoObservable(this);
  }

  /**
   * Set a new value
   */
  set(newValue: T): void {
    this.value = newValue;
  }
}
