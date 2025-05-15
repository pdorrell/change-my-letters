import { makeAutoObservable } from 'mobx';
import { WordGraphNode } from './WordGraphNode';

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

  constructor(node: WordGraphNode, letter: string, position: number) {
    this.value = letter;
    this.position = position;

    // Get the letter properties from the word graph node
    this.canDelete = node.canDelete(position);
    this.replacements = node.getPossibleReplacements(position);
    this.canReplace = this.replacements.length > 0;

    // Set case change properties
    this.canUpperCase = letter === letter.toLowerCase() && letter !== '' && node.canUppercase(position);
    this.canLowerCase = letter === letter.toUpperCase() && letter !== '' && node.canLowercase(position);

    makeAutoObservable(this);
  }
}