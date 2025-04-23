import { makeAutoObservable } from 'mobx';

/**
 * Represents a graph of words where edges connect words that differ by a single letter
 */
export class WordGraph {
  // A map from words to arrays of words that are one letter away
  private adjacencyList: Map<string, string[]> = new Map();
  
  // All words in the graph
  words: Set<string> = new Set();
  
  constructor() {
    makeAutoObservable(this);
  }
  
  /**
   * Load a pre-computed word graph from JSON
   */
  loadFromJson(jsonData: Record<string, string[]>): void {
    this.adjacencyList.clear();
    this.words.clear();
    
    for (const [word, connections] of Object.entries(jsonData)) {
      this.adjacencyList.set(word, connections);
      this.words.add(word);
      
      // Add connected words to the set
      for (const connectedWord of connections) {
        this.words.add(connectedWord);
      }
    }
  }
  
  /**
   * Compute the word graph from a list of words
   */
  computeFromWordList(wordList: string[]): void {
    this.adjacencyList.clear();
    this.words.clear();
    
    // Add all words to the set
    for (const word of wordList) {
      this.words.add(word);
      this.adjacencyList.set(word, []);
    }
    
    // For each word, find all connected words (one letter difference)
    for (const word of wordList) {
      const connections: string[] = [];
      
      for (const otherWord of wordList) {
        if (word !== otherWord && this.isOneLetterDifference(word, otherWord)) {
          connections.push(otherWord);
        }
      }
      
      this.adjacencyList.set(word, connections);
    }
  }
  
  /**
   * Check if two words differ by exactly one letter
   */
  private isOneLetterDifference(word1: string, word2: string): boolean {
    // If lengths differ by more than 1, words can't be one letter different
    if (Math.abs(word1.length - word2.length) > 1) {
      return false;
    }
    
    // Handle insertion/deletion case
    if (word1.length !== word2.length) {
      const [shorter, longer] = word1.length < word2.length 
        ? [word1, word2] 
        : [word2, word1];
      
      // Check if longer has one extra letter compared to shorter
      for (let i = 0; i <= shorter.length; i++) {
        const candidate = longer.substring(0, i) + longer.substring(i + 1);
        if (candidate === shorter) {
          return true;
        }
      }
      return false;
    }
    
    // Handle replacement case (same length)
    let differences = 0;
    for (let i = 0; i < word1.length; i++) {
      if (word1[i] !== word2[i]) {
        // Check for case difference (which is considered a one-letter difference)
        if (word1[i].toLowerCase() === word2[i].toLowerCase()) {
          return true; // Case difference counts as one letter difference
        }
        differences++;
      }
      if (differences > 1) {
        return false;
      }
    }
    
    return differences === 1;
  }
  
  /**
   * Get all words connected to the given word
   */
  getConnectedWords(word: string): string[] {
    return this.adjacencyList.get(word) || [];
  }
  
  /**
   * Get possible letter replacements for a position in a word
   */
  getPossibleReplacements(word: string, position: number): string[] {
    if (position < 0 || position >= word.length) {
      return [];
    }
    
    const connectedWords = this.getConnectedWords(word);
    const replacements = new Set<string>();
    
    for (const connectedWord of connectedWords) {
      // Only consider words of the same length where the difference
      // is at the specified position
      if (connectedWord.length === word.length &&
          this.differAtPosition(word, connectedWord, position)) {
        replacements.add(connectedWord[position]);
      }
    }
    
    return Array.from(replacements);
  }
  
  /**
   * Check if two words differ only at the specified position
   */
  private differAtPosition(word1: string, word2: string, position: number): boolean {
    if (word1.length !== word2.length || position >= word1.length) {
      return false;
    }
    
    for (let i = 0; i < word1.length; i++) {
      if (i === position) {
        // Must differ at the specified position
        if (word1[i] === word2[i]) {
          return false;
        }
      } else {
        // Must be the same at all other positions
        if (word1[i] !== word2[i]) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Get possible letters that can be inserted at a position in a word
   */
  getPossibleInsertions(word: string, position: number): string[] {
    if (position < 0 || position > word.length) {
      return [];
    }
    
    const connectedWords = this.getConnectedWords(word);
    const insertions = new Set<string>();
    
    for (const connectedWord of connectedWords) {
      // Only consider words that are one character longer
      if (connectedWord.length === word.length + 1) {
        const prefix = word.substring(0, position);
        const suffix = word.substring(position);
        
        // Check if this connected word is the result of inserting
        // a character at the specified position
        if (connectedWord.startsWith(prefix) && 
            connectedWord.endsWith(suffix) && 
            connectedWord.length === prefix.length + suffix.length + 1) {
          insertions.add(connectedWord[position]);
        }
      }
    }
    
    return Array.from(insertions);
  }
  
  /**
   * Check if deleting a letter at the specified position results in a valid word
   */
  canDeleteLetterAt(word: string, position: number): boolean {
    if (position < 0 || position >= word.length) {
      return false;
    }
    
    const newWord = word.substring(0, position) + word.substring(position + 1);
    return this.words.has(newWord);
  }
  
  /**
   * Check if changing case of a letter results in a valid word
   */
  canChangeCaseAt(word: string, position: number): boolean {
    if (position < 0 || position >= word.length) {
      return false;
    }
    
    const letter = word[position];
    const newLetter = letter === letter.toLowerCase() 
      ? letter.toUpperCase() 
      : letter.toLowerCase();
    
    if (letter === newLetter) {
      return false; // No case difference (e.g., for numbers)
    }
    
    const newWord = word.substring(0, position) + newLetter + word.substring(position + 1);
    return this.words.has(newWord);
  }
}