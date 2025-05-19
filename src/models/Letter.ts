import { makeAutoObservable } from 'mobx';
import { Word } from './Word';

/**
 * Model representing a single letter in a word
 */
export class Letter {
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
}