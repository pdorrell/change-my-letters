import { makeAutoObservable } from 'mobx';
import { Position } from './Position';
import { WordInteraction } from './WordInteraction';

/**
 * Model representing the interaction state for a position
 */
export class PositionInteraction {
  // The position this interaction is for
  position: Position;

  // Reference to the parent word interaction
  wordInteraction: WordInteraction;

  // Whether the insert menu is currently open
  isInsertMenuOpen: boolean = false;

  constructor(position: Position, wordInteraction: WordInteraction) {
    this.position = position;
    this.wordInteraction = wordInteraction;

    makeAutoObservable(this);
  }

  toggleInsertMenu(): void {
    this.isInsertMenuOpen = !this.isInsertMenuOpen;
  }
}