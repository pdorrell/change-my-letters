import { makeAutoObservable } from 'mobx';

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
 * Represents a node in the word graph, containing all possible operations
 * that can be performed on a word
 */
export class WordGraphNode {
  constructor(
    // The word this node represents
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
    const letter = this.word[position];
    return letter === letter.toLowerCase()
      ? this.canUppercase(position)
      : this.canLowercase(position);
  }

  /**
   * Create a WordGraphNode from the JSON representation
   */
  static fromJson(word: string, data: Record<string, unknown>): WordGraphNode {
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

    return new WordGraphNode(
      word,
      deletes,
      inserts,
      replaces,
      uppercase,
      lowercase
    );
  }
  
  /**
   * Convert this node to its JSON representation
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
