import { makeObservable, observable, action } from 'mobx';

export class Filter {
  value: string = '';
  matchStartOnly: boolean = false;

  constructor() {
    makeObservable(this, {
      value: observable,
      matchStartOnly: observable,
      setValue: action,
      setMatchStartOnly: action,
    });
  }

  setValue(value: string): void {
    this.value = value;
  }

  setMatchStartOnly(matchStartOnly: boolean): void {
    this.matchStartOnly = matchStartOnly;
  }

  filtered(strings: string[]): string[] {
    if (this.value === '') {
      return strings;
    }

    const filterValue = this.value.toLowerCase();
    return strings.filter(str => {
      const lowerStr = str.toLowerCase();
      return this.matchStartOnly
        ? lowerStr.startsWith(filterValue)
        : lowerStr.includes(filterValue);
    });
  }
}
