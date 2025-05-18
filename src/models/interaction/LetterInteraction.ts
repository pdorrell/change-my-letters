import { makeAutoObservable } from 'mobx';
import { Letter } from '../Letter';
import { WordInteraction } from './WordInteraction';

/**
 * Model representing the interaction state for a letter
 */
export class LetterInteraction {
  // Whether the replacement menu is currently open
  isReplaceMenuOpen: boolean = false;

  constructor(
    // The letter this interaction is for
    public readonly letter: Letter,

    // Reference to the parent word interaction
    public readonly wordInteraction: WordInteraction
  ) {
    makeAutoObservable(this);
  }

  toggleReplaceMenu(): void {
    this.isReplaceMenuOpen = !this.isReplaceMenuOpen;
  }
}