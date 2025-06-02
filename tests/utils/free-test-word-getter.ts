import { Word } from '../../src/models/word';
import { WordGetter } from '../../src/models/word-getter';

/**
 * A test implementation of WordGetter that can dynamically create Word objects as needed.
 * Unlike WordGraph which has a fixed set of words, this class will create new Word objects
 * on demand when getRequiredWord() is called, making it useful for testing Word.populateChanges()
 * without needing to mock Word objects.
 *
 * Example usage:
 * ```typescript
 * const getter = new FreeTestWordGetter();
 * const word = getter.getRequiredWord('cat');
 * word.populateChanges(getter); // Will automatically create Word objects for 'at', 'ca', etc.
 * ```
 */
export class FreeTestWordGetter implements WordGetter {
  private words: Map<string, Word> = new Map();

  /**
   * Create a FreeTestWordGetter with an optional initial list of words
   * @param initialWords Optional array of Word objects to start with
   */
  constructor(initialWords: Word[] = []) {
    for (const word of initialWords) {
      this.words.set(word.word, word);
    }
  }

  /**
   * Add a word to this getter
   * @param word The Word object to add
   */
  addWord(word: Word): void {
    this.words.set(word.word, word);
  }

  /**
   * Get a Word object by its string value. If the word doesn't exist,
   * create a new Word object and add it to the collection.
   * @param word The word string to look up
   * @returns The Word object
   */
  getRequiredWord(word: string): Word {
    let wordObj = this.words.get(word);
    if (!wordObj) {
      // Create a Word with default values for testing that allow some operations
      const deletes = new Array(word.length).fill(true);  // Allow deletion of all letters
      const inserts = new Array(word.length + 1).fill('abc'); // Allow insertion of a, b, c at all positions
      const replaces = new Array(word.length).fill('abc');    // Allow replacement with a, b, c for all letters

      wordObj = new Word(word, deletes, inserts, replaces);
      this.words.set(word, wordObj);
    }
    return wordObj;
  }

  /**
   * Get all words currently in this getter
   * @returns Array of all Word objects
   */
  getAllWords(): Word[] {
    return Array.from(this.words.values());
  }

  /**
   * Get the number of words in this getter
   * @returns The count of words
   */
  getWordCount(): number {
    return this.words.size;
  }

  /**
   * Check if a word exists in this getter
   * @param word The word string to check
   * @returns True if the word exists
   */
  hasWord(word: string): boolean {
    return this.words.has(word);
  }
}
