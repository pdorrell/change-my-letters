import { makeAutoObservable } from 'mobx';
import { Word } from './Word';

/**
 * Model representing a position where a letter can be inserted
 */
export class Position {
  // Position index
  index: number;

  // Reference to parent word
  private word: Word;

  constructor(word: Word, index: number) {
    this.index = index;
    this.word = word;

    makeAutoObservable(this);
  }

  // Possible letters that can be inserted
  get insertOptions(): string[] {
    return this.word.getPossibleInsertions(this.index);
  }

  // Whether a letter can be inserted at this position
  get canInsert(): boolean {
    return this.insertOptions.length > 0;
  }
}