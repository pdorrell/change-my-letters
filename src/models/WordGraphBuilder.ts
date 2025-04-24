/**
 * Builds a word graph from a list of words
 */
export class WordGraphBuilder {
  // Set of all words
  private words: Set<string> = new Set();
  
  // Maps for storing build data
  private deleteMap: Map<string, string[]> = new Map();
  private insertMap: Map<string, string[]> = new Map();
  private replaceMap: Map<string, string[]> = new Map();
  private caseMap: Map<string, string[]> = new Map();
  
  constructor(wordList: string[]) {
    // Initialize word set
    for (const word of wordList) {
      this.words.add(word);
    }
  }
  
  /**
   * Build the word graph
   */
  build(): Record<string, any> {
    this.processDeleteInsertOperations();
    this.processReplaceOperations();
    this.processCaseOperations();
    
    return this.createGraphJson();
  }
  
  /**
   * Process all deletion and insertion operations
   */
  private processDeleteInsertOperations(): void {
    // Clear the maps first to avoid duplicates
    this.deleteMap.clear();
    this.insertMap.clear();
    
    // First, process deletions and record associated insertions
    for (const word of this.words) {
      for (let i = 0; i < word.length; i++) {
        const deletion = word.substring(0, i) + word.substring(i + 1);
        
        // If deletion is a valid word
        if (this.words.has(deletion)) {
          // Record deletion
          if (!this.deleteMap.has(word)) {
            this.deleteMap.set(word, []);
          }
          this.deleteMap.get(word)!.push(deletion);
          
          // Record insertion (reverse of deletion) with metadata to track position
          if (!this.insertMap.has(deletion)) {
            this.insertMap.set(deletion, []);
          }
          // Record both the word and the position where the letter was inserted
          this.insertMap.get(deletion)!.push(`${i}:${word}`);
        }
      }
    }
  }
  
  /**
   * Process all replacement operations
   */
  private processReplaceOperations(): void {
    // Maps for finding words that differ by one letter
    const dottedWordsMap: Map<string, string[]> = new Map();
    
    // First, create a map of dotted words to original words
    for (const word of this.words) {
      for (let i = 0; i < word.length; i++) {
        const dottedWord = word.substring(0, i) + '.' + word.substring(i + 1);
        
        if (!dottedWordsMap.has(dottedWord)) {
          dottedWordsMap.set(dottedWord, []);
        }
        dottedWordsMap.get(dottedWord)!.push(word);
      }
    }
    
    // Connect words that share the same dotted pattern
    for (const [, words] of dottedWordsMap.entries()) {
      if (words.length > 1) {
        for (let i = 0; i < words.length; i++) {
          for (let j = i + 1; j < words.length; j++) {
            const word1 = words[i];
            const word2 = words[j];
            
            // Find the position where they differ
            const diffPos = this.findDifferingPosition(word1, word2);
            if (diffPos !== -1) {
              // Record replacements in both directions
              this.recordReplacement(word1, word2, diffPos);
              this.recordReplacement(word2, word1, diffPos);
            }
          }
        }
      }
    }
  }
  
  /**
   * Process all case change operations
   */
  private processCaseOperations(): void {
    const lowerCaseMap: Map<string, string[]> = new Map();
    
    // Group words by their lowercase form
    for (const word of this.words) {
      const lowerCased = word.toLowerCase();
      
      if (lowerCased !== word) { // Skip if already lowercase
        if (!lowerCaseMap.has(lowerCased)) {
          lowerCaseMap.set(lowerCased, []);
        }
        lowerCaseMap.get(lowerCased)!.push(word);
      }
    }
    
    // Connect words by case changes
    for (const [lowerCased, words] of lowerCaseMap.entries()) {
      // If the lowercase version is in the word list, connect it with all variants
      if (this.words.has(lowerCased)) {
        for (const variant of words) {
          // Find position where they differ in case
          const diffPos = this.findCaseDifferingPosition(lowerCased, variant);
          if (diffPos !== -1) {
            // Record case changes
            this.recordCaseChange(lowerCased, variant, diffPos);
            this.recordCaseChange(variant, lowerCased, diffPos);
          }
        }
      }
      
      // Connect case variants that differ by one letter case
      if (words.length > 1) {
        for (let i = 0; i < words.length; i++) {
          for (let j = i + 1; j < words.length; j++) {
            const diffPos = this.findCaseDifferingPosition(words[i], words[j]);
            if (diffPos !== -1) {
              this.recordCaseChange(words[i], words[j], diffPos);
              this.recordCaseChange(words[j], words[i], diffPos);
            }
          }
        }
      }
    }
  }
  
  /**
   * Record a replacement operation
   */
  private recordReplacement(fromWord: string, toWord: string, position: number): void {
    if (!this.replaceMap.has(fromWord)) {
      this.replaceMap.set(fromWord, []);
    }
    this.replaceMap.get(fromWord)!.push(`${position}:${toWord[position]}`);
  }
  
  /**
   * Record a case change operation
   */
  private recordCaseChange(fromWord: string, toWord: string, position: number): void {
    if (!this.caseMap.has(fromWord)) {
      this.caseMap.set(fromWord, []);
    }
    this.caseMap.get(fromWord)!.push(`${position}:${toWord[position]}`);
  }
  
  /**
   * Find the position where two words differ
   */
  private findDifferingPosition(word1: string, word2: string): number {
    if (word1.length !== word2.length) return -1;
    
    for (let i = 0; i < word1.length; i++) {
      if (word1[i].toLowerCase() !== word2[i].toLowerCase()) {
        return i;
      }
    }
    
    return -1;
  }
  
  /**
   * Find the position where two words differ only by case
   */
  private findCaseDifferingPosition(word1: string, word2: string): number {
    if (word1.length !== word2.length) return -1;
    
    let diffPos = -1;
    let diffCount = 0;
    
    for (let i = 0; i < word1.length; i++) {
      if (word1[i] !== word2[i]) {
        // Check if they differ only by case
        if (word1[i].toLowerCase() !== word2[i].toLowerCase()) {
          return -1; // Differ by more than just case
        }
        
        diffPos = i;
        diffCount++;
        
        if (diffCount > 1) {
          return -1; // More than one case difference
        }
      }
    }
    
    return diffCount === 1 ? diffPos : -1;
  }
  
  /**
   * Create the final JSON representation of the graph
   */
  private createGraphJson(): Record<string, any> {
    const jsonGraph: Record<string, any> = {};
    
    for (const word of this.words) {
      const wordData: Record<string, any> = {};
      
      // Process deletions
      if (this.deleteMap.has(word)) {
        const deletions = this.deleteMap.get(word)!;
        let deleteString = '';
        
        for (let i = 0; i < word.length; i++) {
          let canDelete = false;
          for (const deletion of deletions) {
            if (word.substring(0, i) + word.substring(i + 1) === deletion) {
              canDelete = true;
              break;
            }
          }
          deleteString += canDelete ? word[i] : '.';
        }
        
        wordData.delete = deleteString;
      }
      
      // Process insertions
      if (this.insertMap.has(word)) {
        const insertions = this.insertMap.get(word)!;
        const insertArrays: string[] = Array(word.length + 1).fill('');
        
        for (const insertion of insertions) {
          // Parse the insertion metadata (position:word)
          const [posStr, insertedWord] = insertion.split(':');
          const pos = parseInt(posStr, 10);
          
          // The letter that was inserted is at position pos in the inserted word
          const insertedLetter = insertedWord[pos];
          insertArrays[pos] += insertedLetter;
        }
        
        // Convert to slash-separated string
        wordData.insert = insertArrays.join('/');
      }
      
      // Process replacements
      if (this.replaceMap.has(word)) {
        const replacements = this.replaceMap.get(word)!;
        const replaceArrays: string[] = Array(word.length).fill('');
        
        for (const replacement of replacements) {
          const [posStr, letter] = replacement.split(':');
          const pos = parseInt(posStr, 10);
          replaceArrays[pos] += letter;
        }
        
        // Convert to slash-separated string
        wordData.replace = replaceArrays.join('/');
      }
      
      // Process case changes
      if (this.caseMap.has(word)) {
        const caseChanges = this.caseMap.get(word)!;
        let uppercaseString = '.'.repeat(word.length);
        let lowercaseString = '.'.repeat(word.length);
        
        for (const caseChange of caseChanges) {
          const [posStr, letter] = caseChange.split(':');
          const pos = parseInt(posStr, 10);
          
          // Check if it's an uppercase or lowercase change
          if (letter === letter.toUpperCase() && letter !== letter.toLowerCase()) {
            // This is an uppercase change
            uppercaseString = uppercaseString.substring(0, pos) + word[pos] + uppercaseString.substring(pos + 1);
          } else if (letter === letter.toLowerCase() && letter !== letter.toUpperCase()) {
            // This is a lowercase change
            lowercaseString = lowercaseString.substring(0, pos) + word[pos] + lowercaseString.substring(pos + 1);
          }
        }
        
        if (uppercaseString !== '.'.repeat(word.length)) {
          wordData.uppercase = uppercaseString;
        }
        
        if (lowercaseString !== '.'.repeat(word.length)) {
          wordData.lowercase = lowercaseString;
        }
      }
      
      // Include all words in the graph, even those with no connections
      jsonGraph[word] = wordData;
    }
    
    return jsonGraph;
  }
}