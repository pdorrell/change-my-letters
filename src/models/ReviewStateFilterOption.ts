import { Word } from './Word';

/**
 * Filter option for review pronunciation state
 */
export class ReviewStateFilterOption {
  constructor(
    public readonly label: string,
    public readonly include: (word: Word) => boolean
  ) {}

  static readonly ALL = new ReviewStateFilterOption('All', () => true);
  
  static readonly UNREVIEWED = new ReviewStateFilterOption('Un-reviewed', (word: Word) => !word.reviewed);
  
  static readonly WRONG = new ReviewStateFilterOption('Wrong', (word: Word) => word.soundsWrong);
  
  static readonly UNREVIEWED_OR_WRONG = new ReviewStateFilterOption('Un-reviewed or Wrong', (word: Word) => !word.reviewed || word.soundsWrong);

  static readonly options = [
    ReviewStateFilterOption.ALL,
    ReviewStateFilterOption.UNREVIEWED,
    ReviewStateFilterOption.WRONG,
    ReviewStateFilterOption.UNREVIEWED_OR_WRONG
  ];
}