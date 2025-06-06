import { ValueModel } from '@/lib/models/value-models';

export class Filter {
  value: ValueModel<string>;
  matchStartOnly: ValueModel<boolean>;

  constructor(matchStartOnly: boolean = false) {
    this.value = new ValueModel('', 'Filter text', 'Text to filter the word list');
    this.matchStartOnly = new ValueModel(matchStartOnly, 'Match start only', 'Only show words that start with the filter text');
  }

  filtered(strings: string[]): string[] {
    if (this.value.value === '') {
      return strings;
    }

    const filterValue = this.value.value.toLowerCase();
    return strings.filter(str => {
      const lowerStr = str.toLowerCase();
      return this.matchStartOnly.value
        ? lowerStr.startsWith(filterValue)
        : lowerStr.includes(filterValue);
    });
  }
}
