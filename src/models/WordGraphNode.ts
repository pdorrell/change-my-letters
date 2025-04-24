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
  // Boolean arrays indicating whether each letter can be deleted
  deletes: boolean[] = [];

  // Arrays of possible letters that can be inserted at each position
  inserts: string[] = [];

  // Arrays of possible letters that can replace each current letter
  replaces: string[] = [];

  // Boolean arrays indicating whether each letter can be uppercased
  uppercase: boolean[] = [];

  // Boolean arrays indicating whether each letter can be lowercased
  lowercase: boolean[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Get possible replacements for a letter at the given position
   */
  getReplacements(position: number): string {
    return this.replaces[position] || '';
  }

  /**
   * Get possible insertions at the given position
   */
  getInsertions(position: number): string {
    return this.inserts[position] || '';
  }

  /**
   * Check if a letter at the given position can be deleted
   */
  canDelete(position: number): boolean {
    return this.deletes[position] || false;
  }

  /**
   * Check if a letter at the given position can be uppercased
   */
  canUppercase(position: number): boolean {
    return this.uppercase[position] || false;
  }

  /**
   * Check if a letter at the given position can be lowercased
   */
  canLowercase(position: number): boolean {
    return this.lowercase[position] || false;
  }

  /**
   * Create a WordGraphNode from the JSON representation
   */
  static fromJson(word: string, data: Record<string, any>): WordGraphNode {
    const node = new WordGraphNode();
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
    node.inserts = parseSlashSeparatedString(data.insert, wordLength + 1);
    node.replaces = parseSlashSeparatedString(data.replace, wordLength);

    // Process boolean arrays (deletes, uppercase, lowercase)
    node.deletes = parseBooleanString(data.delete, wordLength);
    node.uppercase = parseBooleanString(data.uppercase, wordLength);
    node.lowercase = parseBooleanString(data.lowercase, wordLength);

    return node;
  }
}
