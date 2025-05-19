import { makeAutoObservable } from 'mobx';
import { Letter } from './Letter';
import { Position } from './Position';
import { WordChanges, DeleteChange, InsertChange, ReplaceChange } from './WordChange';
import { WordGetter } from './WordGetter';

/**
 * Exception thrown when there's an error parsing the JSON for a word graph
 */
export class ParseWordGraphJsonException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseWordGraphJsonException';
  }
}

/**
 * Represents a word in the word graph, containing all possible operations
 * that can be performed on it
 */
export class Word {
  // No cached properties needed as MobX automatically caches computed values

  // Object references to possible word changes
  public readonly changes: WordChanges = new WordChanges();

  constructor(
    // The word string this represents
    public readonly word: string,

    // Boolean arrays indicating whether each letter can be deleted
    public readonly deletes: boolean[],

    // Arrays of possible letters that can be inserted at each position
    public readonly inserts: string[],

    // Arrays of possible letters that can replace each current letter
    public readonly replaces: string[]
  ) {
    makeAutoObservable(this);
  }

  // Cache the letters array to maintain object identity
  private _letters: Letter[] | null = null;
  
  /**
   * Get the letters for this word
   * We manually cache this to maintain object identity
   */
  get letters(): Letter[] {
    if (!this._letters) {
      this._letters = Array.from(this.word).map(
        (letter, index) => new Letter(this, letter, index)
      );
    }
    return this._letters;
  }

  // Cache the positions array to maintain object identity
  private _positions: Position[] | null = null;

  /**
   * Get the positions for this word
   * We manually cache this to maintain object identity
   */
  get positions(): Position[] {
    if (!this._positions) {
      this._positions = Array(this.word.length + 1)
        .fill(0)
        .map((_, index) => new Position(this, index));
    }
    return this._positions;
  }

  /**
   * Get possible replacements for a letter at the given position
   * @returns The string of possible replacement letters, or empty string if none
   */
  getReplacements(position: number): string {
    return this.replaces[position];
  }

  /**
   * Get possible replacements for a letter at the given position as an array
   * @returns Array of possible replacement letters
   */
  getPossibleReplacements(position: number): string[] {
    const replacements = this.getReplacements(position);
    return replacements ? replacements.split('') : [];
  }

  /**
   * Get possible insertions at the given position
   * @returns The string of possible insertion letters, or empty string if none
   */
  getInsertions(position: number): string {
    return this.inserts[position];
  }

  /**
   * Get possible insertions at the given position as an array
   * @returns Array of possible insertion letters
   */
  getPossibleInsertions(position: number): string[] {
    const insertions = this.getInsertions(position);
    return insertions ? insertions.split('') : [];
  }

  /**
   * Check if a letter at the given position can be deleted
   * @returns True if the letter can be deleted
   */
  canDelete(position: number): boolean {
    return this.deletes[position];
  }

  // Case-related methods have been removed

  /**
   * Get all possible words that can be reached from this word through a single change
   * @returns Array of words that can be created from this word with one change
   */
  get possibleNextWords(): string[] {
    const possibleWords: Set<string> = new Set();
    const currentWord = this.word;

    // Words from letter deletions
    for (let i = 0; i < currentWord.length; i++) {
      if (this.canDelete(i)) {
        const newWord = currentWord.substring(0, i) + currentWord.substring(i + 1);
        possibleWords.add(newWord);
      }
    }

    // Words from letter replacements
    for (let i = 0; i < currentWord.length; i++) {
      const replacements = this.getPossibleReplacements(i);
      for (const letter of replacements) {
        const newWord = currentWord.substring(0, i) + letter + currentWord.substring(i + 1);
        possibleWords.add(newWord);
      }
    }

    // Words from letter insertions
    for (let i = 0; i <= currentWord.length; i++) {
      const insertions = this.getPossibleInsertions(i);
      for (const letter of insertions) {
        const newWord = currentWord.substring(0, i) + letter + currentWord.substring(i);
        possibleWords.add(newWord);
      }
    }

    return Array.from(possibleWords);
  }

  /**
   * Create a Word from the JSON representation
   */
  static fromJson(word: string, data: Record<string, unknown>): Word {
    const wordLength = word.length;

    /**
     * Parses a slash-separated string into an array of strings
     * @param str The string to parse
     * @param expectedLength The expected length of the resulting array
     * @returns An array of strings
     */
    function parseSlashSeparatedString(str: string | undefined, expectedLength: number): string[] {
      if (!str) {
        // Return array of empty strings with the correct length
        return Array(expectedLength).fill('');
      }

      // Handle slash-separated string format
      const parts = str.split('/');
      if (parts.length !== expectedLength) {
        throw new ParseWordGraphJsonException(
          `Expected ${expectedLength} elements in '${str}', got ${parts.length}`
        );
      }

      return parts.map(part => part || '');
    }

    /**
     * Parses a string representing boolean values (non-'.' = true)
     * @param str The string to parse
     * @param expectedLength The expected length of the resulting array
     * @returns An array of booleans
     */
    function parseBooleanString(str: string | undefined, expectedLength: number): boolean[] {
      if (!str) {
        // Return array of false values with the correct length
        return Array(expectedLength).fill(false);
      }

      if (str.length !== expectedLength) {
        throw new ParseWordGraphJsonException(
          `Expected string of length ${expectedLength}, got ${str.length}`
        );
      }

      return Array.from(str).map(char => char !== '.');
    }

    // Process string arrays (inserts, replaces)
    const inserts = parseSlashSeparatedString(data.insert as string | undefined, wordLength + 1);
    const replaces = parseSlashSeparatedString(data.replace as string | undefined, wordLength);

    // Process boolean arrays (deletes)
    const deletes = parseBooleanString(data.delete as string | undefined, wordLength);

    return new Word(
      word,
      deletes,
      inserts,
      replaces
    );
  }

  /**
   * Convert this word to its JSON representation
   */
  toJson(): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    // Convert boolean arrays to strings, using the actual letters from the word
    if (this.deletes.some(val => val)) {
      let deleteString = '';
      for (let i = 0; i < this.deletes.length; i++) {
        // Use the actual letter from the word when the boolean is true
        deleteString += this.deletes[i] ? this.word[i] : '.';
      }
      result.delete = deleteString;
    }

    // Convert string arrays to slash-separated strings
    if (this.inserts.some(str => str.length > 0)) {
      result.insert = this.inserts.join('/');
    }

    if (this.replaces.some(str => str.length > 0)) {
      result.replace = this.replaces.join('/');
    }

    // Always return the result, even if empty
    return result;
  }

  /**
   * Populate the changes attribute with direct object references to resulting Words
   * @param wordGetter Interface for retrieving Word objects by string
   */
  populateChanges(wordGetter: WordGetter): void {
    const currentWord = this.word;
    const deleteChanges: (DeleteChange | null)[] = [];
    const insertChanges: InsertChange[][] = [];
    const replaceChanges: ReplaceChange[][] = [];

    const getWordOrNull = (word: string): Word | null => {
      return wordGetter.getWord(word);
    }

    // Initialize arrays - create a proper initialization for all arrays
    for (let i = 0; i < currentWord.length; i++) {
      deleteChanges[i] = null; // Initialize with null for letters that can't be deleted
      replaceChanges[i] = [];
    }

    for (let i = 0; i <= currentWord.length; i++) {
      insertChanges[i] = [];
    }

    // Populate deletion changes
    for (let i = 0; i < currentWord.length; i++) {
      
      if (this.canDelete(i)) {
        const newWordStr = currentWord.substring(0, i) + currentWord.substring(i + 1);
        const resultWord = getWordOrNull(newWordStr);

        if (resultWord) {
          const change = new DeleteChange(resultWord);
          deleteChanges[i] = change;
        }
      }
    }

    // Populate replacement changes
    for (let i = 0; i < currentWord.length; i++) {
      const replacements = this.getPossibleReplacements(i);

      for (const letter of replacements) {
        const newWordStr = currentWord.substring(0, i) + letter + currentWord.substring(i + 1);
        const resultWord = getWordOrNull(newWordStr);

        if (resultWord) {
          const change = new ReplaceChange(resultWord, letter);
          replaceChanges[i].push(change);
        }
      }
    }

    // Populate insertion changes
    for (let i = 0; i <= currentWord.length; i++) {
      const insertions = this.getPossibleInsertions(i);

      for (const letter of insertions) {
        const newWordStr = currentWord.substring(0, i) + letter + currentWord.substring(i);
        const resultWord = getWordOrNull(newWordStr);

        if (resultWord) {
          const change = new InsertChange(resultWord, letter);
          insertChanges[i].push(change);
        }
      }
    }

    // Set the changes directly
    this.changes.deleteChanges = deleteChanges;
    this.changes.insertChanges = insertChanges;
    this.changes.replaceChanges = replaceChanges;

    // Changes have been populated

    // Populate letter and position changes
    this.populateLetterChanges();
    this.populatePositionChanges();
  }

  /**
   * Populate the changes for all letters in this word
   */
  private populateLetterChanges(): void {
    console.log(`Populating letter changes for word "${this.word}":`, {
      deleteChanges: this.changes.deleteChanges.map(dc => dc ? true : false),
      replaceChanges: this.changes.replaceChanges.map(arr => arr.length)
    });
    
    // Iterate over letters to set their changes
    this.letters.forEach((letter, index) => {
      
      const deleteChange = this.changes.deleteChanges && index < this.changes.deleteChanges.length ? 
                           this.changes.deleteChanges[index] : null;
                           
      const replaceChanges = this.changes.replaceChanges && index < this.changes.replaceChanges.length ? 
                            this.changes.replaceChanges[index] : [];

      console.log(`Setting changes for letter "${letter.value}" at position ${letter.position}:`, {
        deleteChange: deleteChange ? true : false,
        replaceChanges: replaceChanges.length
      });

      // Set the letter changes
      letter.setChanges(deleteChange, replaceChanges);
    });
  }

  /**
   * Populate the changes for all positions in this word
   */
  private populatePositionChanges(): void {
    // Iterate over positions to set their changes
    this.positions.forEach((position, index) => {
      
      const insertChanges = this.changes.insertChanges && index < this.changes.insertChanges.length ? 
                           this.changes.insertChanges[index] : [];

      // Set the position changes
      position.setChanges(insertChanges);
    });
  }
}
