import { makeAutoObservable } from 'mobx';
import { Letter } from './Letter';
import { Position } from './Position';
import { AppState } from './AppState';
import { WordGraph } from './WordGraph';
import { HistoryModel } from './HistoryModel';

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
    this.positions.push(new Position(this, 0));

    // Create letters and positions between letters
    for (let i = 0; i < word.length; i++) {
      this.letters.push(new Letter(this, word[i], i));
      this.positions.push(new Position(this, i + 1));
    }
  }

  /**
   * Update the current word to a new value
   */
  updateWord(newWord: string): void {
    this.value = newWord;
    this.initializeWord(newWord);
  }

  /**
   * Update the state of this word's letters and positions based on the word graph and history
   * @param wordGraph The word graph containing possible operations
   * @param history The history model to check for previously visited words
   */
  updateState(wordGraph: WordGraph, history: HistoryModel): void {
    const word = this.value;
    
    // Update whether the word has been previously visited
    this.previouslyVisited = history.hasVisited(word);
    
    // Update letter states
    for (let i = 0; i < this.letters.length; i++) {
      const letter = this.letters[i];
      
      // Check if this letter can be deleted
      letter.canDelete = wordGraph.canDeleteLetterAt(word, i);
      
      // Check if this letter can be replaced and get possible replacements
      const replacements = wordGraph.getPossibleReplacements(word, i);
      letter.canReplace = replacements.length > 0;
      letter.replacements = replacements;
      
      // Check if this letter can change case
      letter.canUpperCase = wordGraph.canChangeCaseAt(word, i) && 
                          letter.value === letter.value.toLowerCase() && 
                          letter.value !== letter.value.toUpperCase();
      
      letter.canLowerCase = wordGraph.canChangeCaseAt(word, i) && 
                         letter.value === letter.value.toUpperCase() && 
                         letter.value !== letter.value.toLowerCase();
    }
    
    // Update position states
    for (let i = 0; i < this.positions.length; i++) {
      const position = this.positions[i];
      
      // Check if a letter can be inserted at this position
      const insertions = wordGraph.getPossibleInsertions(word, i);
      position.canInsert = insertions.length > 0;
      position.insertOptions = insertions;
    }
  }
}