import { makeAutoObservable } from 'mobx';
import { Word } from '@/models/Word';
import { PositionChanges, InsertChange } from '@/models/word-change';

/**
 * Model representing a position where a letter can be inserted
 */
export class Position {
  // Direct object references to possible changes
  public changes: PositionChanges = new PositionChanges();

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

  /**
   * Set the possible changes for this position
   * @param insertChanges Array of changes that result from inserting letters at this position
   */
  setChanges(insertChanges: InsertChange[]): void {
    // Set changes for position

    // Direct assignment to property
    this.changes.insertChanges = insertChanges || [];
  }
}
