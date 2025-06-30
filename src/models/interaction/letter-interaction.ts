import { makeAutoObservable, action, computed } from 'mobx';
import React from 'react';
import { Letter } from '@/models/Letter';
import { MenuManagerInterface } from '@/lib/views/menu-manager-interface';
import { Word } from '@/models/Word';
import { ButtonAction } from '@/lib/models/actions';
import { WordSelectionByLetter } from '@/models/changer/word-selection-by-letter';
import { InteractionOptions } from './interaction-options';

/**
 * Model representing the interaction state for a letter
 */
export class LetterInteraction {
  // Whether the replacement menu is currently open
  isReplaceMenuOpen: boolean = false;

  // Reference to the letter element for menu positioning
  menuRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

  // Reference to the replace menu element for testing
  replaceMenuRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

  constructor(
    // The letter this interaction is for
    public readonly letter: Letter,

    // Handler function for setting new words
    public readonly newWordHandler: (word: Word) => void,

    // Reference to the menu manager
    public readonly menuManager: MenuManagerInterface,

    // Interaction options
    public readonly options: InteractionOptions = { disabled: false, showChangeHints: false, alwaysInteract: false }
  ) {
    makeAutoObservable(this, {
      setNewWord: action,
      deleteAction: computed,
      letterClickAction: computed,
      openReplaceMenuAction: computed,
      selectionOfReplacementLetter: computed,
      actionPending: computed,
      menuRef: false, // Don't make the ref observable
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
   * Whether to show change hints (delete/replace icons)
   */
  get showChangeHints(): boolean {
    return this.options.showChangeHints !== false;
  }

  /**
   * Get the delete action for this letter
   */
  get deleteAction(): ButtonAction {
    // If disabled, return a disabled action
    if (this.options.disabled) {
      return new ButtonAction(null, { tooltip: "Delete this letter" });
    }

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
   * Get the action for clicking on the letter (opens menu if delete or replace is available)
   */
  get letterClickAction(): ButtonAction {
    // If disabled, return a disabled action
    if (this.options.disabled) {
      return new ButtonAction(null, { tooltip: "Click to change this letter" });
    }

    // If alwaysInteract is true, always return an enabled action even if no changes are possible
    if (this.options.alwaysInteract) {
      return new ButtonAction(() => {
        this.menuManager.toggleMenu(
          this.isReplaceMenuOpen,
          action(() => { this.isReplaceMenuOpen = true; }),
          this.menuRef
        );
      }, {
        tooltip: "Click to change this letter",
        onPress: () => this.menuManager.closeMenus()
      });
    }

    // If the letter can't be replaced and can't be deleted, return a disabled action
    if (!this.letter.canReplace && !this.letter.canDelete) {
      return new ButtonAction(null, { tooltip: "Click to change this letter" });
    }

    // Otherwise, return an action that toggles the replace menu (which now includes delete option)
    return new ButtonAction(() => {
      this.menuManager.toggleMenu(
        this.isReplaceMenuOpen,
        action(() => { this.isReplaceMenuOpen = true; }),
        this.menuRef
      );
    }, {
      tooltip: "Click to change this letter",
      onPress: () => this.menuManager.closeMenus()
    });
  }

  /**
   * Get the action that opens the replace menu for this letter
   */
  get openReplaceMenuAction(): ButtonAction {
    // If disabled, return a disabled action
    if (this.options.disabled) {
      return new ButtonAction(null, { tooltip: "Replace this letter" });
    }

    // If the letter can't be replaced, return a disabled action
    if (!this.letter.canReplace) {
      return new ButtonAction(null, { tooltip: "Replace this letter" });
    }

    // Otherwise, return an action that toggles the replace menu
    return new ButtonAction(() => {
      this.menuManager.toggleMenu(
        this.isReplaceMenuOpen,
        action(() => { this.isReplaceMenuOpen = true; }),
        this.menuRef
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
