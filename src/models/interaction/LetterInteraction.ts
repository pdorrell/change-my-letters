import { makeAutoObservable, action, computed } from 'mobx';
import { Letter } from '../Letter';
import { WordInteraction } from './WordInteraction';
import { MenuManager } from '../MenuManager';
import { Word } from '../Word';
import { ButtonAction } from '../../lib/ui/actions';

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
    public readonly wordInteraction: WordInteraction,
    
    // Reference to the menu manager
    public readonly menuManager: MenuManager
  ) {
    makeAutoObservable(this, {
      setNewWord: action,
      deleteAction: computed
    });
  }
  
  /**
   * Get the delete action for this letter
   */
  get deleteAction(): ButtonAction {
    // If the letter can't be deleted, return a disabled action
    if (!this.letter.canDelete || !this.letter.changes.deleteChange) {
      return new ButtonAction(null);
    }
    
    // Otherwise, return an action that performs the delete
    return new ButtonAction(() => {
      if (this.letter.changes.deleteChange) {
        this.setNewWord(this.letter.changes.deleteChange.result);
      }
    });
  }

  toggleReplaceMenu(): void {
    this.isReplaceMenuOpen = !this.isReplaceMenuOpen;
  }
  
  /**
   * Set a new word for the application
   * @param wordObj The Word object to set as the new word
   */
  setNewWord(wordObj: Word): void {
    // Close the menu
    this.isReplaceMenuOpen = false;
    
    // Use the wordInteraction's appState to set the new word
    this.wordInteraction.setNewWord(wordObj);
  }
}