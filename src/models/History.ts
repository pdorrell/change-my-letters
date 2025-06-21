import { makeAutoObservable } from 'mobx';
import { Word } from '@/models/Word';

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
  word: Word;
  wordString: string; // Keep string representation for compatibility
  change?: WordChange; // No change for the initial word
};

/**
 * Interface for objects that can handle word changes and track visited words
 */
export interface WordStateManager {
  setWordChanger(word: Word): Promise<void>;
  previouslyVisitedWords: Set<string>;
}

/**
 * Model for tracking the history of word changes
 */
export class History {
  // List of all words in order
  entries: HistoryEntry[] = [];

  // Current pointer in the history (for undo/redo)
  currentIndex: number = 0;

  // Reference to word state manager
  wordStateManager: WordStateManager;

  constructor(wordStateManager: WordStateManager, initialWord: Word) {
    this.wordStateManager = wordStateManager;

    // Initialize with the starting word
    this.entries = [{ word: initialWord, wordString: initialWord.word }];

    makeAutoObservable(this);
  }

  /**
   * Add a new word to the history
   */
  addWord(word: Word, change?: WordChange): void {
    // If we're not at the end of the history, remove all future entries
    if (this.currentIndex < this.entries.length - 1) {
      this.entries = this.entries.slice(0, this.currentIndex + 1);
    }

    // Add the new word to history
    this.entries.push({ word, wordString: word.word, change });

    // Update the index
    this.currentIndex = this.entries.length - 1;
  }

  /**
   * Check if a word has been visited before
   */
  hasVisited(word: Word | string): boolean {
    if (typeof word === 'string') {
      return this.wordStateManager.previouslyVisitedWords.has(word);
    } else {
      return word.previouslyVisited;
    }
  }

  /**
   * Undo the last change
   */
  undo(): Word | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.entries[this.currentIndex].word;
    }
    return null;
  }

  /**
   * Redo a previously undone change
   */
  redo(): Word | null {
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
   * Get the word changer
   */
  get wordChanger(): Word {
    return this.entries[this.currentIndex].word;
  }

  /**
   * Jump to a specific point in history
   */
  jumpToIndex(index: number): Word | null {
    if (index >= 0 && index < this.entries.length) {
      this.currentIndex = index;
      return this.entries[index].word;
    }
    return null;
  }

  /**
   * Clear the history and start with a new word
   */
  reset(initialWord: Word): void {
    this.entries = [{ word: initialWord, wordString: initialWord.word }];
    this.currentIndex = 0;
  }

}
