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
   */
  getReplacements(position: number): string {
    return this.replaces[position];
  }

  /**
   * Get possible insertions at the given position
   */
  getInsertions(position: number): string {
    return this.inserts[position];
  }

  /**
   * Check if a letter at the given position can be deleted
   */
  canDelete(position: number): boolean {
    return this.deletes[position];
  }

  /**
   * Check if a letter at the given position can be uppercased
   */
  canUppercase(position: number): boolean {
    return this.uppercase[position];
  }

  /**
   * Check if a letter at the given position can be lowercased
   */
  canLowercase(position: number): boolean {
    return this.lowercase[position];
  }

  /**
   * Create a WordGraphNode from the JSON representation
   */
  static fromJson(word: string, data: Record<string, any>): WordGraphNode {
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
    const inserts = parseSlashSeparatedString(data.insert, wordLength + 1);
    const replaces = parseSlashSeparatedString(data.replace, wordLength);

    // Process boolean arrays (deletes, uppercase, lowercase)
    const deletes = parseBooleanString(data.delete, wordLength);
    const uppercase = parseBooleanString(data.uppercase, wordLength);
    const lowercase = parseBooleanString(data.lowercase, wordLength);

    return new WordGraphNode(
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
  toJson(): Record<string, any> {
    const result: Record<string, any> = {};
    let hasData = false;
    
    // Convert boolean arrays to strings
    if (this.deletes.some(val => val)) {
      let deleteString = '';
      for (let i = 0; i < this.deletes.length; i++) {
        // The character to use when the boolean is true doesn't matter as long as it's not '.'
        // By convention we use the letter at that position
        deleteString += this.deletes[i] ? 'D' : '.';
      }
      result.delete = deleteString;
      hasData = true;
    }
    
    if (this.uppercase.some(val => val)) {
      let uppercaseString = '';
      for (let i = 0; i < this.uppercase.length; i++) {
        // By convention we use the letter at that position
        uppercaseString += this.uppercase[i] ? 'U' : '.';
      }
      result.uppercase = uppercaseString;
      hasData = true;
    }
    
    if (this.lowercase.some(val => val)) {
      let lowercaseString = '';
      for (let i = 0; i < this.lowercase.length; i++) {
        // By convention we use the letter at that position
        lowercaseString += this.lowercase[i] ? 'L' : '.';
      }
      result.lowercase = lowercaseString;
      hasData = true;
    }
    
    // Convert string arrays to slash-separated strings
    if (this.inserts.some(str => str.length > 0)) {
      result.insert = this.inserts.join('/');
      hasData = true;
    }
    
    if (this.replaces.some(str => str.length > 0)) {
      result.replace = this.replaces.join('/');
      hasData = true;
    }
    
    return hasData ? result : {};
  }
}
