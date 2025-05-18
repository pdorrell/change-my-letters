import { makeAutoObservable } from 'mobx';
import { Letter } from './Letter';
import { Position } from './Position';

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
  // Cached letter and position objects for this word
  private _letters: Letter[] | null = null;
  private _positions: Position[] | null = null;

  constructor(
    // The word string this represents
    public readonly word: string,
    
    // Boolean arrays indicating whether each letter can be deleted
    public readonly deletes: boolean[],
    
    // Arrays of possible letters that can be inserted at each position
    public readonly inserts: string[],
    
    // Arrays of possible letters that can replace each current letter
    public readonly replaces: string[],
    
    // Boolean arrays indicating whether each letter can be uppercased
    public readonly uppercase: boolean[],
    
    // Boolean arrays indicating whether each letter can be lowercased
    public readonly lowercase: boolean[]
  ) {
    makeAutoObservable(this);
  }

  /**
   * Get the letters for this word, creating them if they don't exist
   */
  getLetters(): Letter[] {
    if (!this._letters) {
      this._letters = Array.from(this.word).map(
        (letter, index) => new Letter(this, letter, index)
      );
    }
    return this._letters;
  }

  /**
   * Get the positions for this word, creating them if they don't exist
   */
  getPositions(): Position[] {
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

  /**
   * Check if a letter at the given position can be uppercased
   * @returns True if the letter can be uppercased
   */
  canUppercase(position: number): boolean {
    return this.uppercase[position];
  }

  /**
   * Check if a letter at the given position can be lowercased
   * @returns True if the letter can be lowercased
   */
  canLowercase(position: number): boolean {
    return this.lowercase[position];
  }
  
  /**
   * Check if changing the case of a letter at the given position results in a valid word
   * @param position The position of the letter to check
   * @returns True if case change is possible at this position
   */
  canChangeCaseAt(position: number): boolean {
    return this.canUppercase(position) || this.canLowercase(position);
  }

  /**
   * Get all possible words that can be reached from this word through a single change
   * @returns Array of words that can be created from this word with one change
   */
  getPossibleNextWords(): string[] {
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
    
    // Words from case changes
    for (let i = 0; i < currentWord.length; i++) {
      if (this.canUppercase(i)) {
        const newWord = currentWord.substring(0, i) + 
                        currentWord[i].toUpperCase() + 
                        currentWord.substring(i + 1);
        possibleWords.add(newWord);
      }
      
      if (this.canLowercase(i)) {
        const newWord = currentWord.substring(0, i) + 
                        currentWord[i].toLowerCase() + 
                        currentWord.substring(i + 1);
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

    // Process boolean arrays (deletes, uppercase, lowercase)
    const deletes = parseBooleanString(data.delete as string | undefined, wordLength);
    const uppercase = parseBooleanString(data.uppercase as string | undefined, wordLength);
    const lowercase = parseBooleanString(data.lowercase as string | undefined, wordLength);

    return new Word(
      word,
      deletes,
      inserts,
      replaces,
      uppercase,
      lowercase
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
    
    if (this.uppercase.some(val => val)) {
      let uppercaseString = '';
      for (let i = 0; i < this.uppercase.length; i++) {
        // Use the actual letter from the word when the boolean is true
        uppercaseString += this.uppercase[i] ? this.word[i] : '.';
      }
      result.uppercase = uppercaseString;
    }
    
    if (this.lowercase.some(val => val)) {
      let lowercaseString = '';
      for (let i = 0; i < this.lowercase.length; i++) {
        // Use the actual letter from the word when the boolean is true
        lowercaseString += this.lowercase[i] ? this.word[i] : '.';
      }
      result.lowercase = lowercaseString;
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
}