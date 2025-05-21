import { makeObservable, observable, computed, action } from 'mobx';
import { AppState } from '../AppState';
import { LetterInteraction } from './LetterInteraction';
import { PositionInteraction } from './PositionInteraction';
import { Word } from '../Word';
import { Letter } from '../Letter';
import { Position } from '../Position';
import { MenuManager } from '../MenuManager';

/**
 * Model representing the user's current interaction with a word
 */
export class WordInteraction {
  // The word property is now defined in the constructor

  // Whether this word has been visited before
  public previouslyVisited: boolean;

  // Array of letter interactions
  letterInteractions: LetterInteraction[] = [];

  // Array of position interactions
  positionInteractions: PositionInteraction[] = [];

  // For backward compatibility - get the underlying letters
  get letters(): Letter[] {
    return this.letterInteractions.map(interaction => interaction.letter);
  }

  // For backward compatibility - get the underlying positions
  get positions(): Position[] {
    return this.positionInteractions.map(interaction => interaction.position);
  }

  constructor(
    // The Word object this interaction is for
    public word: Word,
    
    // Reference to the app state
    public readonly appState: AppState,
    
    // Reference to the menu manager
    public readonly menuManager: MenuManager,
    
    hasBeenVisited: boolean = false
  ) {
    this.previouslyVisited = hasBeenVisited;

    // Initialize letter and position interactions
    this.initializeInteractions();

    // Use makeObservable instead of makeAutoObservable for classes with inheritance
    makeObservable(this, {
      word: observable,
      previouslyVisited: observable,
      letterInteractions: observable,
      positionInteractions: observable,
      letters: computed,
      positions: computed,
      value: computed,
      updateWord: action,
      closeAllMenus: action,
      say: action,
      setNewWord: action
    });
  }

  /**
   * Initialize the letter and position interactions for this word
   */
  private initializeInteractions(): void {
    // Get the base Letter and Position objects from the word
    const letters = this.word.letters;
    const positions = this.word.positions;

    // Create interaction wrappers for each
    this.letterInteractions = letters.map(
      letter => new LetterInteraction(letter, this, this.menuManager)
    );

    this.positionInteractions = positions.map(
      position => new PositionInteraction(position, this, this.menuManager)
    );
  }

  /**
   * Update to a new word
   */
  updateWord(word: Word, hasBeenVisited: boolean): void {
    this.word = word;
    this.previouslyVisited = hasBeenVisited;

    // Reinitialize interactions for the new word
    this.initializeInteractions();
  }

  /**
   * Get the current word value
   */
  get value(): string {
    return this.word.word;
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

  /**
   * Say the current word using the wordSayer
   */
  say(): void {
    // Use the wordSayer to play the audio for this word
    this.appState.wordSayer.say(this.word.word);
  }
  
  /**
   * Set a new word for the application
   * @param wordObj The Word object to set as the new word
   */
  setNewWord(wordObj: Word): void {
    // Use the appState to set the new word
    this.appState.setNewWord(wordObj);
  }
}
