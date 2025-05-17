import { makeObservable, observable, computed, action } from 'mobx';
import { AppState } from '../AppState';
import { LetterInteraction } from './LetterInteraction';
import { PositionInteraction } from './PositionInteraction';
import { Word } from '../Word';
import { Letter } from '../Letter';
import { Position } from '../Position';

/**
 * Model representing the user's current interaction with a word
 */
export class WordInteraction {
  // The word being interacted with
  word: Word;

  // Reference to the app state
  appState: AppState;

  // Whether this word has been visited before
  previouslyVisited: boolean;

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

  constructor(wordOrString: Word | string, appState: AppState, hasBeenVisited: boolean = false) {
    if (typeof wordOrString === 'string') {
      // If a string was passed, get the word from the wordGraph
      const word = appState.wordGraph.getNode(wordOrString);
      if (!word) {
        throw new Error(`Word "${wordOrString}" doesn't exist in the word graph`);
      }
      this.word = word;
    } else {
      // If a Word object was passed, use it directly
      this.word = wordOrString;
    }

    this.appState = appState;
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
      say: action
    });
  }

  /**
   * Initialize the letter and position interactions for this word
   */
  private initializeInteractions(): void {
    // Get the base Letter and Position objects from the word
    const letters = this.word.getLetters();
    const positions = this.word.getPositions();

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
   * Say the current word using text-to-speech
   */
  say(): void {
    const word = this.value.toLowerCase();

    // Create an audio element and play the corresponding mp3
    try {
      const audio = new Audio(`/assets/words/eleven_labs/${word}.mp3`);
      audio.play().catch(error => {
        console.error(`Error playing word audio for "${word}":`, error);
      });
    } catch (error) {
      console.error(`Error creating audio for word "${word}":`, error);
    }
  }
}
