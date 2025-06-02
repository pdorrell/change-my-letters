import { makeAutoObservable, action, computed } from 'mobx';
import React from 'react';
import { Letter } from '../letter';
import { MenuManagerInterface } from '../../lib/views/menu-manager-interface';
import { Word } from '../word';
import { ButtonAction } from '../../lib/models/actions';
import { WordSelectionByLetter } from '../word-selection-by-letter';

/**
 * Model representing the interaction state for a letter
 */
export class LetterInteraction {
  // Whether the replacement menu is currently open
  isReplaceMenuOpen: boolean = false;

  // Reference to the replace button element
  replaceButtonRef: React.RefObject<HTMLButtonElement> = React.createRef<HTMLButtonElement>();

  // Reference to the replace menu element for testing
  replaceMenuRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

  constructor(
    // The letter this interaction is for
    public readonly letter: Letter,

    // Handler function for setting new words
    public readonly newWordHandler: (word: Word) => void,

    // Reference to the menu manager
    public readonly menuManager: MenuManagerInterface
  ) {
    makeAutoObservable(this, {
      setNewWord: action,
      deleteAction: computed,
      openReplaceMenuAction: computed,
      selectionOfReplacementLetter: computed,
      actionPending: computed,
      replaceButtonRef: false, // Don't make the ref observable
      replaceMenuRef: false // Don't make the ref observable
    });
  }

  /**
   * Whether there is a pending action on this letter
   */
  get actionPending(): boolean {
    return this.isReplaceMenuOpen;
  }

  /**
   * Get the delete action for this letter
   */
  get deleteAction(): ButtonAction {
    // If the letter can't be deleted, return a disabled action
    if (!this.letter.canDelete || !this.letter.changes.deleteChange) {
      return new ButtonAction(null, { tooltip: "Delete this letter" });
    }

    // Otherwise, return an action that performs the delete
    return new ButtonAction(() => {
      if (this.letter.changes.deleteChange) {
        this.setNewWord(this.letter.changes.deleteChange.result);
      }
    }, {
      tooltip: "Delete this letter",
      onPress: () => this.menuManager.closeMenus()
    });
  }

  /**
   * Get the action that opens the replace menu for this letter
   */
  get openReplaceMenuAction(): ButtonAction {
    // If the letter can't be replaced, return a disabled action
    if (!this.letter.canReplace) {
      return new ButtonAction(null, { tooltip: "Replace this letter" });
    }

    // Otherwise, return an action that toggles the replace menu
    return new ButtonAction(() => {
      this.menuManager.toggleMenu(
        this.isReplaceMenuOpen,
        action(() => { this.isReplaceMenuOpen = true; }),
        this.replaceButtonRef
      );
    }, {
      tooltip: "Replace this letter",
      onPress: () => this.menuManager.closeMenus()
    });
  }

  /**
   * Get the selection of replacement letters for this letter
   */
  get selectionOfReplacementLetter(): WordSelectionByLetter {
    return new WordSelectionByLetter(
      this.letter.changes.replaceChanges,
      (wordObj: Word) => this.setNewWord(wordObj)
    );
  }

  /**
   * Set a new word for the application
   * @param wordObj The Word object to set as the new word
   */
  setNewWord(wordObj: Word): void {
    // Close the menu using an action
    action(() => {
      this.isReplaceMenuOpen = false;
    })();

    // Use the newWordHandler to set the new word
    this.newWordHandler(wordObj);
  }
}
