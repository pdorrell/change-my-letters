import { makeAutoObservable } from 'mobx';
import { Position } from '../Position';
import { WordInteraction } from './WordInteraction';
import { MenuManager } from '../MenuManager';

/**
 * Model representing the interaction state for a position
 */
export class PositionInteraction {
  // Whether the insert menu is currently open
  isInsertMenuOpen: boolean = false;

  constructor(
    // The position this interaction is for
    public readonly position: Position,

    // Reference to the parent word interaction
    public readonly wordInteraction: WordInteraction,
    
    // Reference to the menu manager
    public readonly menuManager: MenuManager
  ) {
    makeAutoObservable(this);
  }

  toggleInsertMenu(): void {
    this.isInsertMenuOpen = !this.isInsertMenuOpen;
  }
}