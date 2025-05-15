import { makeAutoObservable } from 'mobx';
import { Word } from './Word';

/**
 * Model representing a position where a letter can be inserted
 */
export class Position {
  // Position index
  index: number;

  // Whether a letter can be inserted at this position
  canInsert: boolean = false;

  // Possible letters that can be inserted
  insertOptions: string[] = [];

  constructor(word: Word, index: number) {
    this.index = index;

    // Get the position properties from the word
    this.insertOptions = word.getPossibleInsertions(index);
    this.canInsert = this.insertOptions.length > 0;

    makeAutoObservable(this);
  }
}