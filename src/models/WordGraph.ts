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
   * Compute the word graph from a list of words using an efficient algorithm
   * based on the algorithm outlined in CLAUDE.md
   */
  computeFromWordList(wordList: string[]): void {
    this.adjacencyList.clear();
    this.words.clear();
    
    // Add all words to the set and initialize adjacency list
    for (const word of wordList) {
      this.words.add(word);
      this.adjacencyList.set(word, []);
    }
    
    // Maps for storing intermediate results
    const connections: Map<string, string[]> = new Map();
    const dottedWordsMap: Map<string, string[]> = new Map();
    const lowerCaseMap: Map<string, string[]> = new Map();
    
    // Process all words
    for (const word of wordList) {
      // Initialize connections for this word
      if (!connections.has(word)) {
        connections.set(word, []);
      }
      
      // Process deletions and insertions
      this.processDeleteInsertOperations(word, connections);
      
      // Process replacements
      this.processReplaceOperations(word, dottedWordsMap);
      
      // Process case changes
      this.processCaseOperations(word, lowerCaseMap);
    }
    
    // Connect words based on replacements (words that differ by one letter)
    this.connectWordsByReplacements(dottedWordsMap, connections);
    
    // Connect words based on case changes
    this.connectWordsByCaseChanges(lowerCaseMap, connections);
    
    // Set the final adjacency list
    for (const [word, wordConnections] of connections.entries()) {
      // Filter to ensure only words in our word list are included
      const validConnections = wordConnections.filter(connection => this.words.has(connection));
      this.adjacencyList.set(word, validConnections);
    }
  }
  
  /**
   * Process delete and insert operations for a word
   */
  private processDeleteInsertOperations(word: string, connections: Map<string, string[]>): void {
    // Check all possible deletions
    for (let i = 0; i < word.length; i++) {
      const deletion = word.substring(0, i) + word.substring(i + 1);
      
      // If the deletion is a valid word, add connections
      if (this.words.has(deletion)) {
        // Add deletion connection
        this.addConnection(connections, word, deletion);
        
        // Add insert connection (reverse of deletion)
        this.addConnection(connections, deletion, word);
      }
    }
  }
  
  /**
   * Process replacement operations for a word
   */
  private processReplaceOperations(word: string, dottedWordsMap: Map<string, string[]>): void {
    // Check all possible replacements
    for (let i = 0; i < word.length; i++) {
      // Create a "dotted word" with a dot at position i
      const dottedWord = word.substring(0, i) + '.' + word.substring(i + 1);
      
      // Add this word to the dotted word map
      if (!dottedWordsMap.has(dottedWord)) {
        dottedWordsMap.set(dottedWord, []);
      }
      dottedWordsMap.get(dottedWord)!.push(word);
    }
  }
  
  /**
   * Process case change operations for a word
   */
  private processCaseOperations(word: string, lowerCaseMap: Map<string, string[]>): void {
    // Check if this word has any uppercase or lowercase letters
    const lowerCased = word.toLowerCase();
    
    // Skip if the word is already all lowercase
    if (lowerCased === word) {
      return;
    }
    
    // Add this word to the lowercase map
    if (!lowerCaseMap.has(lowerCased)) {
      lowerCaseMap.set(lowerCased, []);
    }
    lowerCaseMap.get(lowerCased)!.push(word);
  }
  
  /**
   * Connect words by replacements based on dotted words map
   */
  private connectWordsByReplacements(dottedWordsMap: Map<string, string[]>, connections: Map<string, string[]>): void {
    // For each dotted word pattern
    for (const [, words] of dottedWordsMap.entries()) {
      // If there are multiple words with this pattern, they are connected
      if (words.length > 1) {
        // Connect all pairs of words with this pattern
        for (let i = 0; i < words.length; i++) {
          for (let j = i + 1; j < words.length; j++) {
            // Add bidirectional connections
            this.addConnection(connections, words[i], words[j]);
            this.addConnection(connections, words[j], words[i]);
          }
        }
      }
    }
  }
  
  /**
   * Connect words by case changes based on lowercase map
   */
  private connectWordsByCaseChanges(lowerCaseMap: Map<string, string[]>, connections: Map<string, string[]>): void {
    // For each lowercase word
    for (const [lowerCased, words] of lowerCaseMap.entries()) {
      // If the lowercase version is also in our word list
      if (this.words.has(lowerCased)) {
        // Connect the lowercase word to all its uppercase variants
        for (const upperVariant of words) {
          this.addConnection(connections, lowerCased, upperVariant);
          this.addConnection(connections, upperVariant, lowerCased);
        }
      }
      
      // Also connect uppercase variants that differ by one letter case
      if (words.length > 1) {
        for (let i = 0; i < words.length; i++) {
          for (let j = i + 1; j < words.length; j++) {
            // Only connect if they differ by exactly one case
            if (this.differsOnlyByOneCase(words[i], words[j])) {
              this.addConnection(connections, words[i], words[j]);
              this.addConnection(connections, words[j], words[i]);
            }
          }
        }
      }
    }
  }
  
  /**
   * Check if two words differ only by one letter's case
   */
  private differsOnlyByOneCase(word1: string, word2: string): boolean {
    if (word1.length !== word2.length) {
      return false;
    }
    
    let differences = 0;
    for (let i = 0; i < word1.length; i++) {
      if (word1[i] !== word2[i]) {
        // If they differ by more than just case, return false
        if (word1[i].toLowerCase() !== word2[i].toLowerCase()) {
          return false;
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
   * Add a connection between two words
   */
  private addConnection(connections: Map<string, string[]>, from: string, to: string): void {
    if (!connections.has(from)) {
      connections.set(from, []);
    }
    
    const existingConnections = connections.get(from)!;
    if (!existingConnections.includes(to)) {
      existingConnections.push(to);
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