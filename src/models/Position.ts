import { makeAutoObservable } from 'mobx';
import { CurrentWord } from './CurrentWord';

/**
 * Model representing a position where a letter can be inserted
 */
export class Position {
  // Position index
  index: number;

  // Reference to the parent word
  word: CurrentWord;

  // Whether a letter can be inserted at this position
  canInsert: boolean = false;

  // Possible letters that can be inserted
  insertOptions: string[] = [];

  // Whether the insert menu is currently open
  isInsertMenuOpen: boolean = false;

  constructor(index: number, word: CurrentWord) {
    this.index = index;
    this.word = word;

    // In a real implementation, these would be determined by the word graph
    this.canInsert = true;
    this.insertOptions = ['a', 'e', 'i', 'o', 'u']; // Placeholder

    makeAutoObservable(this);
  }

  toggleInsertMenu(): void {
    this.isInsertMenuOpen = !this.isInsertMenuOpen;
  }
}