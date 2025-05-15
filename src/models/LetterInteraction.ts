import { makeAutoObservable } from 'mobx';
import { Letter } from './Letter';
import { WordInteraction } from './WordInteraction';

/**
 * Model representing the interaction state for a letter
 */
export class LetterInteraction {
  // The letter this interaction is for
  letter: Letter;

  // Reference to the parent word interaction
  wordInteraction: WordInteraction;

  // Whether the replacement menu is currently open
  isReplaceMenuOpen: boolean = false;

  constructor(letter: Letter, wordInteraction: WordInteraction) {
    this.letter = letter;
    this.wordInteraction = wordInteraction;

    makeAutoObservable(this);
  }

  toggleReplaceMenu(): void {
    this.isReplaceMenuOpen = !this.isReplaceMenuOpen;
  }
}