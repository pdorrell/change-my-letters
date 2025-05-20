import { Word } from './Word';

/**
 * Interface for getting Word objects by their string representation
 */
export interface WordGetter {
  /**
   * Get a Word object by its string value
   * @param word The word string to look up
   * @returns The Word object, which has to be found
   */
  getRequiredWord(word: string): Word;
}
