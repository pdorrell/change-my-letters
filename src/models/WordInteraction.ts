import { makeAutoObservable, makeObservable, observable, computed, action } from 'mobx';
import { AppState } from './AppState';
import { LetterInteraction } from './LetterInteraction';
import { PositionInteraction } from './PositionInteraction';
import { WordGraphNode } from './WordGraphNode';

/**
 * Model representing the user's current interaction with a word
 */
export class WordInteraction {
  // The word graph node being interacted with
  node: WordGraphNode;

  // Reference to the app state
  appState: AppState;

  // Whether this word has been visited before
  previouslyVisited: boolean;

  // Array of letter interactions
  letterInteractions: LetterInteraction[] = [];

  // Array of position interactions
  positionInteractions: PositionInteraction[] = [];

  constructor(node: WordGraphNode, appState: AppState, hasBeenVisited: boolean) {
    this.node = node;
    this.appState = appState;
    this.previouslyVisited = hasBeenVisited;

    // Initialize letter and position interactions
    this.initializeInteractions();

    // Use makeObservable instead of makeAutoObservable for classes with inheritance
    makeObservable(this, {
      node: observable,
      previouslyVisited: observable,
      letterInteractions: observable,
      positionInteractions: observable,
      value: computed,
      updateWord: action,
      closeAllMenus: action,
      initializeInteractions: action
    });
  }

  /**
   * Initialize the letter and position interactions for this word
   */
  private initializeInteractions(): void {
    // Get the base Letter and Position objects from the node
    const letters = this.node.getLetters();
    const positions = this.node.getPositions();

    // Create interaction wrappers for each
    this.letterInteractions = letters.map(
      letter => new LetterInteraction(letter, this)
    );

    this.positionInteractions = positions.map(
      position => new PositionInteraction(position, this)
    );
  }

  /**
   * Update to a new word
   */
  updateWord(node: WordGraphNode, hasBeenVisited: boolean): void {
    this.node = node;
    this.previouslyVisited = hasBeenVisited;

    // Reinitialize interactions for the new word
    this.initializeInteractions();
  }

  /**
   * Get the current word value
   */
  get value(): string {
    return this.node.word;
  }

  /**
   * Close any open menus
   */
  closeAllMenus(): void {
    this.letterInteractions.forEach(interaction => {
      interaction.isReplaceMenuOpen = false;
    });

    this.positionInteractions.forEach(interaction => {
      interaction.isInsertMenuOpen = false;
    });
  }
}