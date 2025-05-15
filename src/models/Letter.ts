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

  // Whether the letter can be deleted
  canDelete: boolean = false;

  // Whether the letter can be replaced and the potential replacements
  canReplace: boolean = false;
  replacements: string[] = [];

  // Whether this letter can be upper or lower cased
  canUpperCase: boolean = false;
  canLowerCase: boolean = false;

  constructor(word: Word, letter: string, position: number) {
    this.value = letter;
    this.position = position;

    // Get the letter properties from the word
    this.canDelete = word.canDelete(position);
    this.replacements = word.getPossibleReplacements(position);
    this.canReplace = this.replacements.length > 0;

    // Set case change properties
    this.canUpperCase = letter === letter.toLowerCase() && letter !== '' && word.canUppercase(position);
    this.canLowerCase = letter === letter.toUpperCase() && letter !== '' && word.canLowercase(position);

    makeAutoObservable(this);
  }
}