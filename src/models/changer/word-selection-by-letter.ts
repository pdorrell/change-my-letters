import { LetterChange } from '@/models/word-change';
import { Word } from '@/models/Word';

/**
 * Represents a selection of word options by letter with associated selection logic
 */
export class WordSelectionByLetter {
  /**
   * Create a new word selection by letter
   * @param options The letter change options available
   * @param onSelect The function to call when a letter is selected
   */
  constructor(
    public readonly options: LetterChange[],
    public readonly onSelect: (word: Word) => void
  ) {}
}
