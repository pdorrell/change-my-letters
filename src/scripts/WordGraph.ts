/**
 * A simplified version of WordGraph model for script use
 */

import { WordGraphBuilder } from '../models/WordGraphBuilder';

export class WordGraph {
  // All words in the graph
  words: Set<string> = new Set();
  
  constructor() {}
  
  /**
   * Compute the word graph from a list of words
   */
  computeFromWordList(wordList: string[]): void {
    this.words.clear();
    
    // Add all words to the set
    for (const word of wordList) {
      this.words.add(word);
    }
  }
  
  /**
   * Get all words connected to the given word
   */
  getConnectedWords(word: string): string[] {
    // This method is not used in the new implementation
    // but kept for compatibility with scripts
    return [];
  }
  
  /**
   * Get possible letter replacements for a position in a word
   */
  getPossibleReplacements(word: string, position: number): string[] {
    // This is used in generateWordGraphs.ts for compatibility
    return [];
  }
  
  /**
   * Get possible letters that can be inserted at a position in a word
   */
  getPossibleInsertions(word: string, position: number): string[] {
    // This is used in generateWordGraphs.ts for compatibility
    return [];
  }
  
  /**
   * Check if deleting a letter at the specified position results in a valid word
   */
  canDeleteLetterAt(word: string, position: number): boolean {
    // This is used in generateWordGraphs.ts for compatibility
    return false;
  }
  
  /**
   * Check if changing case of a letter results in a valid word
   */
  canChangeCaseAt(word: string, position: number): boolean {
    // This is used in generateWordGraphs.ts for compatibility
    return false;
  }
  
  /**
   * Generate the word graph from a list of words
   * This is a new method that replaces the old processing logic
   */
  generateWordGraph(wordList: string[]): Record<string, any> {
    const builder = new WordGraphBuilder(wordList);
    return builder.build();
  }
}