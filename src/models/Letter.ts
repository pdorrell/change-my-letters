import { makeAutoObservable } from 'mobx';
import { Word } from './Word';

/**
 * Model representing a single letter in a word
 */
export class Letter {
  // The letter value
  value: string;

  // Position in the word
  position: number;

  // Reference to parent word
  private word: Word;

  constructor(word: Word, letter: string, position: number) {
    this.value = letter;
    this.position = position;
    this.word = word;

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

  // Whether this letter can be upper cased
  get canUpperCase(): boolean {
    return this.value === this.value.toLowerCase() && 
           this.value !== '' && 
           this.word.canUppercase(this.position);
  }

  // Whether this letter can be lower cased
  get canLowerCase(): boolean {
    return this.value === this.value.toUpperCase() && 
           this.value !== '' && 
           this.word.canLowercase(this.position);
  }
}