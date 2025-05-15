import { makeAutoObservable } from 'mobx';
import { Letter } from './Letter';
import { Position } from './Position';
import { AppState } from './AppState';
import { WordGraphNode } from './WordGraphNode';
import { HistoryModel } from './HistoryModel';

/**
 * Model representing the current word being manipulated
 */
export class CurrentWord {
  // The current word value
  value: string;

  // Whether this word has been previously visited
  previouslyVisited: boolean;

  // Array of letter models representing each character
  letters: Letter[] = [];

  // Array of position models representing spaces before, between, and after letters
  positions: Position[] = [];

  // Reference to the app state
  appState: AppState;

  // Reference to the word graph node
  node: WordGraphNode;

  /**
   * Create a new CurrentWord model
   * @param node The WordGraphNode for this word
   * @param appState The AppState reference
   * @param hasBeenVisited Whether this word has been visited before
   */
  constructor(node: WordGraphNode, appState: AppState, hasBeenVisited: boolean) {
    this.value = node.word;
    this.node = node;
    this.appState = appState;
    this.previouslyVisited = hasBeenVisited;

    // Initialize letters and positions
    this.initializeWord();

    makeAutoObservable(this);
  }

  /**
   * Initialize the letters and positions for the current word
   */
  private initializeWord(): void {
    this.letters = [];
    this.positions = [];

    // Create position before first letter
    this.positions.push(new Position(this, 0));

    // Create letters and positions between letters
    for (let i = 0; i < this.value.length; i++) {
      this.letters.push(new Letter(this, this.value[i], i));
      this.positions.push(new Position(this, i + 1));
    }

    // Update the state of the word's letters and positions
    this.updateState();
  }

  /**
   * Update the current word to a new WordGraphNode
   * @param newNode The new WordGraphNode
   * @param hasBeenVisited Whether the new word has been visited before
   */
  updateWord(newNode: WordGraphNode, hasBeenVisited: boolean): void {
    this.value = newNode.word;
    this.node = newNode;
    this.previouslyVisited = hasBeenVisited;
    this.initializeWord();
  }

  /**
   * Update the state of this word's letters and positions based on the node
   */
  updateState(): void {
    // Update letter states
    for (let i = 0; i < this.letters.length; i++) {
      const letter = this.letters[i];
      
      // Check if this letter can be deleted
      letter.canDelete = this.node.canDelete(i);
      
      // Check if this letter can be replaced and get possible replacements
      const replacements = this.node.getPossibleReplacements(i);
      letter.canReplace = replacements.length > 0;
      letter.replacements = replacements;
      
      // Check if this letter can change case
      const canChangeCaseAtPosition = this.node.canChangeCaseAt(i);
      letter.canUpperCase = canChangeCaseAtPosition && 
                          letter.value === letter.value.toLowerCase() && 
                          letter.value !== letter.value.toUpperCase();
      
      letter.canLowerCase = canChangeCaseAtPosition && 
                         letter.value === letter.value.toUpperCase() && 
                         letter.value !== letter.value.toLowerCase();
    }
    
    // Update position states
    for (let i = 0; i < this.positions.length; i++) {
      const position = this.positions[i];
      
      // Check if a letter can be inserted at this position
      const insertions = this.node.getPossibleInsertions(i);
      position.canInsert = insertions.length > 0;
      position.insertOptions = insertions;
    }
  }
}