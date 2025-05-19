import { makeAutoObservable } from 'mobx';
import { Word } from './Word';
import { LetterChanges, DeleteChange, ReplaceChange } from './WordChange';

/**
 * Model representing a single letter in a word
 */
export class Letter {
  // Direct object references to possible changes
  public changes: LetterChanges = new LetterChanges();

  constructor(
    // Reference to parent word
    private word: Word,

    // The letter value
    public readonly value: string,

    // Position in the word
    public readonly position: number
  ) {
    makeAutoObservable(this);
  }

  // Whether the letter can be deleted
  get canDelete(): boolean {
    return this.word.canDelete(this.position);
  }

  // The potential replacements for this letter
  get replacements(): string[] {
    return this.word.getPossibleReplacements(this.position);
  }

  // Whether the letter can be replaced
  get canReplace(): boolean {
    return this.replacements.length > 0;
  }

  // Case-related properties have been removed

  /**
   * Set the possible changes for this letter
   * @param deleteChange The change that results from deleting this letter
   * @param replaceChanges Array of changes that result from replacing this letter
   */
  setChanges(deleteChange: DeleteChange | null, replaceChanges: ReplaceChange[]): void {
    // Set changes for letter
    console.log(`Final letter changes for ${this.value} at position ${this.position}:`, {
      deleteChange: deleteChange ? deleteChange.result.word : null,
      replaceChanges: replaceChanges ? replaceChanges.map(rc => rc.letter) : []
    });
    
    // Direct assignment to properties
    this.changes.deleteChange = deleteChange || null;
    this.changes.replaceChanges = replaceChanges || [];
  }
}
