import { makeAutoObservable } from 'mobx';
import { Letter } from './Letter';
import { Position } from './Position';
import { AppState } from './AppState';

/**
 * Model representing the current word being manipulated
 */
export class CurrentWord {
  // The current word value
  value: string;

  // Whether this word has been previously visited
  previouslyVisited: boolean = false;

  // Array of letter models representing each character
  letters: Letter[] = [];

  // Array of position models representing spaces before, between, and after letters
  positions: Position[] = [];

  // Reference to the app state
  appState: AppState;

  constructor(word: string, appState?: AppState) {
    this.value = word;
    this.appState = appState as AppState;

    // Initialize letters and positions
    this.initializeWord(word);

    makeAutoObservable(this);
  }

  /**
   * Initialize the letters and positions for a new word
   */
  private initializeWord(word: string): void {
    this.letters = [];
    this.positions = [];

    // Create position before first letter
    this.positions.push(new Position(0, this));

    // Create letters and positions between letters
    for (let i = 0; i < word.length; i++) {
      this.letters.push(new Letter(word[i], i, this));
      this.positions.push(new Position(i + 1, this));
    }
  }

  /**
   * Update the current word to a new value
   */
  updateWord(newWord: string): void {
    this.value = newWord;
    this.initializeWord(newWord);
  }
}