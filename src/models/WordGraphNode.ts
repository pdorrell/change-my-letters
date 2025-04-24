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
     * Parses input data that could be either a slash-separated string or an array
     * @param input The input to parse (string or array)
     * @param expectedLength The expected length of the resulting array
     * @returns An array of strings
     */
    function parseStringArrayInput(input: string | string[] | undefined, expectedLength: number): string[] {
      if (!input) {
        // Return array of empty strings with the correct length
        return Array(expectedLength).fill('');
      }
      
      // Handle array input format
      if (Array.isArray(input)) {
        if (input.length !== expectedLength) {
          throw new ParseWordGraphJsonException(
            `Expected array of length ${expectedLength}, got ${input.length}`
          );
        }
        return input.map(item => item || '');
      }
      
      // Handle slash-separated string format
      const parts = input.split('/');
      if (parts.length !== expectedLength) {
        throw new ParseWordGraphJsonException(
          `Expected ${expectedLength} elements in '${input}', got ${parts.length}`
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
    const inserts = parseStringArrayInput(data.insert, wordLength + 1);
    const replaces = parseStringArrayInput(data.replace, wordLength);

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
}
