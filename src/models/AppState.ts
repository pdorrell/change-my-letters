import { makeAutoObservable } from 'mobx';
import { HistoryModel } from './HistoryModel';
import { WordGraph } from './WordGraph';
import { WordInteraction } from './interaction/WordInteraction';
import { WordSayerInterface } from './WordSayerInterface';
import { ResetInteraction } from './ResetInteraction';
import { Word } from './Word';

// Type for the main application pages
type AppPage = 'wordView' | 'historyView' | 'resetView';

/**
 * Main application state that manages the current page and models
 */
export class AppState {
  // The current page being displayed
  currentPage: AppPage = 'wordView';

  // The current word interaction model
  currentWord: WordInteraction;

  // The word history model
  history: HistoryModel;

  // Audio player for word pronunciation
  
  // Reset word interaction model
  resetInteraction: ResetInteraction;

  // For floating menu positioning
  activeButtonElement: HTMLElement | null = null;

  // Audio settings
  sayImmediately: boolean = true;

  constructor(
    initialWord: string, 
    
    // The word graph model containing possible word connections
    public readonly wordGraph: WordGraph,
    
    // Application version
    public readonly version: string,
    
    // Audio player for word pronunciation
    public readonly wordSayer: WordSayerInterface
  ) {
    
    // Initialize reset interaction
    this.resetInteraction = new ResetInteraction(this);

    // Initialize the current word
    const wordNode = this.wordGraph.getNode(initialWord);
    if (!wordNode) {
      throw new Error(`Word "${initialWord}" doesn't exist in the word graph`);
    }

    // Initialize history with the initial word object
    this.history = new HistoryModel(this, wordNode);

    this.currentWord = new WordInteraction(wordNode, this, false);

    // Preload the initial word's audio
    this.wordSayer.preload(initialWord);

    makeAutoObservable(this);
  }

  /**
   * Set a new current word
   * @param wordObj The Word object to set as the current word
   */
  setNewWord(wordObj: Word): void {
    // Get the word string value
    const word = wordObj.word;

    // Check if the word has been visited before
    const hasBeenVisited = this.history.hasVisited(word);

    // Update the current word
    this.currentWord.updateWord(wordObj, hasBeenVisited);

    // Close any open menus when the word changes
    this.closeAllMenus();

    // Preload the current word (in case it's not already loaded)
    this.wordSayer.preload(word);

    // Preload all possible next words
    const possibleNextWords = wordObj.possibleNextWords;
    for (const nextWord of possibleNextWords) {
      this.wordSayer.preload(nextWord);
    }

    // Say the word immediately if that option is enabled
    if (this.sayImmediately) {
      this.currentWord.say();
    }
  }

  // Note: The deleteLetter, insertLetter, and replaceLetter methods have been removed
  // Changes are now handled directly through LetterChange objects with direct references to resulting Word objects

  // Case-change method has been removed

  /**
   * Undo the last word change
   */
  undo(): void {
    const prevWordObj = this.history.undo();
    if (prevWordObj) {
      this.setNewWord(prevWordObj);
    }
  }

  /**
   * Redo a previously undone word change
   */
  redo(): void {
    const nextWordObj = this.history.redo();
    if (nextWordObj) {
      this.setNewWord(nextWordObj);
    }
  }

  /**
   * Navigate to the reset word page
   */
  resetGame(): void {
    // Navigate to the reset view
    // (The filter reset happens in navigateTo)
    this.navigateTo('resetView');
  }


  /**
   * Navigate to a page
   */
  navigateTo(page: AppPage): void {
    this.currentPage = page;
    
    // If navigating to the reset view, reset the interaction state
    if (page === 'resetView') {
      this.resetInteraction.reset();
    }
  }

  /**
   * Toggle a menu open/closed
   * @param currentlyOpen Current open state of the menu
   * @param setMenuOpen Function to open the menu
   * @param buttonElement Reference to the button element that triggered the menu
   */
  toggleMenu(currentlyOpen: boolean, setMenuOpen: () => void, buttonElement: HTMLElement): void {
    if (!this.currentWord) return;

    // Close all menus first
    this.closeAllMenus();

    // If the menu was previously closed, open it now
    if (!currentlyOpen) {
      this.activeButtonElement = buttonElement;
      setMenuOpen();
    }
  }

  /**
   * Close all menus
   */
  closeAllMenus(): void {
    if (!this.currentWord) return;

    // Use the WordInteraction's closeAllMenus method
    this.currentWord.closeAllMenus();

    // Reset menu state in AppState
    this.activeButtonElement = null;
  }
}
