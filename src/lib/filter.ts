import { makeObservable, observable, action } from 'mobx';
import { ValueModel } from './models/value-models';

export class Filter {
  value: string = '';
  matchStartOnly: ValueModel<boolean>;

  constructor(matchStartOnly: boolean = false) {
    this.matchStartOnly = new ValueModel(matchStartOnly, 'Match start only', 'Only show words that start with the filter text');

    makeObservable(this, {
      value: observable,
      setValue: action,
    });
  }

  setValue(value: string): void {
    this.value = value;
  }

  filtered(strings: string[]): string[] {
    if (this.value === '') {
      return strings;
    }

    const filterValue = this.value.toLowerCase();
    return strings.filter(str => {
      const lowerStr = str.toLowerCase();
      return this.matchStartOnly.value
        ? lowerStr.startsWith(filterValue)
        : lowerStr.includes(filterValue);
    });
  }
}
