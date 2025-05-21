import { makeAutoObservable, action, computed } from 'mobx';
import React from 'react';
import { Position } from '../Position';
import { WordInteraction } from './WordInteraction';
import { MenuManager } from '../MenuManager';
import { Word } from '../Word';
import { ButtonAction } from '../../lib/ui/actions';
import { WordSelectionByLetter } from '../WordSelectionByLetter';

/**
 * Model representing the interaction state for a position
 */
export class PositionInteraction {
  // Whether the insert menu is currently open
  isInsertMenuOpen: boolean = false;
  
  // Reference to the insert button element
  insertButtonRef: React.RefObject<HTMLButtonElement> = React.createRef<HTMLButtonElement>();

  constructor(
    // The position this interaction is for
    public readonly position: Position,

    // Reference to the parent word interaction
    public readonly wordInteraction: WordInteraction,
    
    // Reference to the menu manager
    public readonly menuManager: MenuManager
  ) {
    makeAutoObservable(this, {
      setNewWord: action,
      openInsertMenuAction: computed,
      selectionOfLetterToInsert: computed,
      insertButtonRef: false // Don't make the ref observable
    });
  }
  
  /**
   * Get the action that opens the insert menu for this position
   */
  get openInsertMenuAction(): ButtonAction {
    // If insertion is not possible at this position, return a disabled action
    if (!this.position.canInsert) {
      return new ButtonAction(null);
    }
    
    // Otherwise, return an action that toggles the insert menu
    return new ButtonAction(() => {
      this.menuManager.toggleMenu(
        this.isInsertMenuOpen,
        () => { this.isInsertMenuOpen = true; },
        this.insertButtonRef
      );
    });
  }
  
  /**
   * Get the selection of letters to insert at this position
   */
  get selectionOfLetterToInsert(): WordSelectionByLetter {
    return new WordSelectionByLetter(
      this.position.changes.insertChanges,
      (wordObj: Word) => this.setNewWord(wordObj)
    );
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