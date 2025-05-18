import { makeAutoObservable } from 'mobx';
import { Word } from './Word';

/**
 * Model representing a position where a letter can be inserted
 */
export class Position {
  constructor(
    // Reference to parent word
    private word: Word,
    
    // Position index
    public readonly index: number
  ) {
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