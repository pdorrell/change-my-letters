import { makeAutoObservable, action } from 'mobx';
import { Position } from '../Position';
import { WordInteraction } from './WordInteraction';
import { MenuManager } from '../MenuManager';
import { Word } from '../Word';

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
    makeAutoObservable(this, {
      setNewWord: action
    });
  }

  toggleInsertMenu(): void {
    this.isInsertMenuOpen = !this.isInsertMenuOpen;
  }
  
  /**
   * Set a new word for the application
   * @param wordObj The Word object to set as the new word
   */
  setNewWord(wordObj: Word): void {
    // Close the menu
    this.isInsertMenuOpen = false;
    
    // Use the wordInteraction to set the new word
    this.wordInteraction.setNewWord(wordObj);
  }
}