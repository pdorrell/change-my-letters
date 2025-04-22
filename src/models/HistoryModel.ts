import { makeAutoObservable } from 'mobx';

/**
 * Represents a change from one word to another
 */
export type WordChange = {
  type: 'delete_letter' | 'insert_letter' | 'replace_letter' | 'upper_case_letter' | 'lower_case_letter';
  position: number;
  letter?: string; // For insert and replace
};

/**
 * Represents an entry in the word history
 */
export type HistoryEntry = {
  word: string;
  change?: WordChange; // No change for the initial word
};

/**
 * Model for tracking the history of word changes
 */
export class HistoryModel {
  // List of all words in order
  entries: HistoryEntry[] = [];
  
  // Current pointer in the history (for undo/redo)
  currentIndex: number = 0;
  
  // Set of previously visited words
  visitedWords: Set<string> = new Set();
  
  constructor(initialWord: string) {
    // Initialize with the starting word
    this.entries = [{ word: initialWord }];
    this.visitedWords.add(initialWord);
    
    makeAutoObservable(this);
  }
  
  /**
   * Add a new word to the history
   */
  addWord(word: string, change: WordChange): void {
    // If we're not at the end of the history, remove all future entries
    if (this.currentIndex < this.entries.length - 1) {
      this.entries = this.entries.slice(0, this.currentIndex + 1);
    }
    
    // Add the new word to history
    this.entries.push({ word, change });
    this.visitedWords.add(word);
    
    // Update the current index
    this.currentIndex = this.entries.length - 1;
  }
  
  /**
   * Check if a word has been visited before
   */
  hasVisited(word: string): boolean {
    return this.visitedWords.has(word);
  }
  
  /**
   * Undo the last change
   */
  undo(): string | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.entries[this.currentIndex].word;
    }
    return null;
  }
  
  /**
   * Redo a previously undone change
   */
  redo(): string | null {
    if (this.currentIndex < this.entries.length - 1) {
      this.currentIndex++;
      return this.entries[this.currentIndex].word;
    }
    return null;
  }
  
  /**
   * Check if undo is available
   */
  get canUndo(): boolean {
    return this.currentIndex > 0;
  }
  
  /**
   * Check if redo is available
   */
  get canRedo(): boolean {
    return this.currentIndex < this.entries.length - 1;
  }
  
  /**
   * Get the current word
   */
  get currentWord(): string {
    return this.entries[this.currentIndex].word;
  }
  
  /**
   * Jump to a specific point in history
   */
  jumpToIndex(index: number): string | null {
    if (index >= 0 && index < this.entries.length) {
      this.currentIndex = index;
      return this.entries[index].word;
    }
    return null;
  }
  
  /**
   * Clear the history and start with a new word
   */
  reset(initialWord: string): void {
    this.entries = [{ word: initialWord }];
    this.currentIndex = 0;
    this.visitedWords.clear();
    this.visitedWords.add(initialWord);
  }
}