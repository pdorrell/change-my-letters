import { makeAutoObservable, action, computed } from 'mobx';
import React from 'react';
import { Position } from '@/models/Position';
import { MenuManagerInterface } from '@/lib/views/menu-manager-interface';
import { Word } from '@/models/Word';
import { ButtonAction } from '@/lib/models/actions';
import { WordSelectionByLetter } from '@/models/word-selection-by-letter';
import { InteractionOptions } from './interaction-options';

/**
 * Model representing the interaction state for a position
 */
export class PositionInteraction {
  // Whether the insert menu is currently open
  isInsertMenuOpen: boolean = false;

  // Reference to the insert button element
  insertButtonRef: React.RefObject<HTMLButtonElement> = React.createRef<HTMLButtonElement>();

  // Reference to the insert menu element for testing
  insertMenuRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();

  constructor(
    // The position this interaction is for
    public readonly position: Position,

    // Handler function for setting new words
    public readonly newWordHandler: (word: Word) => void,

    // Reference to the menu manager
    public readonly menuManager: MenuManagerInterface,

    // Interaction options
    public readonly options: InteractionOptions = { disabled: false, showChangeHints: false, alwaysInteract: false }
  ) {
    makeAutoObservable(this, {
      setNewWord: action,
      openInsertMenuAction: computed,
      selectionOfLetterToInsert: computed,
      actionPending: computed,
      insertButtonRef: false, // Don't make the ref observable
      insertMenuRef: false // Don't make the ref observable
    });
  }

  /**
   * Whether there is a pending action on this position
   */
  get actionPending(): boolean {
    return this.isInsertMenuOpen;
  }

  /**
   * Whether to always show the "+" button regardless of whether insertion is possible
   */
  get alwaysShowInsertButton(): boolean {
    return this.options.alwaysInteract === true;
  }

  /**
   * Get the action that opens the insert menu for this position
   */
  get openInsertMenuAction(): ButtonAction {
    // If disabled, return a disabled action
    if (this.options.disabled) {
      return new ButtonAction(null, { tooltip: "Insert a letter here" });
    }

    // If alwaysInteract is true, always return an enabled action even if no insertions are possible
    if (this.options.alwaysInteract) {
      return new ButtonAction(() => {
        this.menuManager.toggleMenu(
          this.isInsertMenuOpen,
          action(() => { this.isInsertMenuOpen = true; }),
          this.insertButtonRef
        );
      }, {
        tooltip: "Insert a letter here",
        onPress: () => this.menuManager.closeMenus()
      });
    }

    // If insertion is not possible at this position, return a disabled action
    if (!this.position.canInsert) {
      return new ButtonAction(null, { tooltip: "Insert a letter here" });
    }

    // Otherwise, return an action that toggles the insert menu
    return new ButtonAction(() => {
      this.menuManager.toggleMenu(
        this.isInsertMenuOpen,
        action(() => { this.isInsertMenuOpen = true; }),
        this.insertButtonRef
      );
    }, {
      tooltip: "Insert a letter here",
      onPress: () => this.menuManager.closeMenus()
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
    // Close the menu using an action
    action(() => {
      this.isInsertMenuOpen = false;
    })();

    // Use the newWordHandler to set the new word
    this.newWordHandler(wordObj);
  }
}
