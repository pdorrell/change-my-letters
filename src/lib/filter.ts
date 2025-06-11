import { ValueModel } from '@/lib/models/value-models';

export const FILTER_MATCH_OPTIONS = ['start', 'end', 'any'];
export type FilterMatchOption = typeof FILTER_MATCH_OPTIONS[number];

export class Filter {
  value: ValueModel<string>;
  matchOption: ValueModel<FilterMatchOption>;

  constructor(matchOption: FilterMatchOption = 'start') {
    this.value = new ValueModel('', 'Filter text', 'Text to filter the word list');
    this.matchOption = new ValueModel(matchOption, 'Match', 'How to match the filter text');
  }

  filtered(strings: string[]): string[] {
    if (this.value.value === '') {
      return strings;
    }

    const filterValue = this.value.value.toLowerCase();
    return strings.filter(str => {
      const lowerStr = str.toLowerCase();
      switch (this.matchOption.value) {
        case 'start':
          return lowerStr.startsWith(filterValue);
        case 'end':
          return lowerStr.endsWith(filterValue);
        case 'any':
          return lowerStr.includes(filterValue);
        default:
          return lowerStr.includes(filterValue);
      }
    });
  }
}
