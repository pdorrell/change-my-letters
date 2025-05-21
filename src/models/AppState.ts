import { makeAutoObservable } from 'mobx';
import { HistoryModel } from './HistoryModel';
import { WordGraph } from './WordGraph';
import { WordInteraction } from './interaction/WordInteraction';
import { WordSayerInterface } from './WordSayerInterface';
import { ResetInteraction } from './ResetInteraction';
import { MenuManager } from './MenuManager';
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

  // Current word being visited
  visitingWord: Word;

  // Set of previously visited words
  previouslyVisitedWords: Set<string> = new Set();
  
  // Reset word interaction model
  resetInteraction: ResetInteraction;

  // Menu state management
  menuManager: MenuManager;

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

    // Initialize menu manager first
    this.menuManager = new MenuManager(() => {
      if (this.currentWord) {
        this.currentWord.closeAllMenus();
      }
    });

    // Initialize visitingWord
    this.visitingWord = wordNode;

    // Initialize history with the initial word object
    this.history = new HistoryModel(this, wordNode);

    // Initialize the current word with the menu manager
    this.currentWord = new WordInteraction(wordNode, this, this.menuManager, false);

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

    // Mark current visiting word as visited and add to the set
    if (this.visitingWord) {
      this.visitingWord.previouslyVisited = true;
      this.previouslyVisitedWords.add(this.visitingWord.word);
    }

    // Update visitingWord to the new word
    this.visitingWord = wordObj;

    // Check if the word has been previously visited
    const hasBeenVisited = wordObj.previouslyVisited;

    // Update the current word
    this.currentWord.updateWord(wordObj, hasBeenVisited);

    // Close any open menus when the word changes
    this.menuManager.closeMenus();

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
    // Get previous word from history
    const prevWordObj = this.history.undo();
    if (prevWordObj) {
      // Set the new current word (which will handle marking the current word as visited)
      this.setNewWord(prevWordObj);
    }
  }

  /**
   * Redo a previously undone word change
   */
  redo(): void {
    // Get next word from history
    const nextWordObj = this.history.redo();
    if (nextWordObj) {
      // Set the new current word (which will handle marking the current word as visited)
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
   * Reset the game with a new initial word
   * @param initialWord The new starting word
   */
  reset(initialWord: Word): void {
    // For all previouslyVisitedWords, set previouslyVisited = false
    this.previouslyVisitedWords.forEach(wordString => {
      const wordNode = this.wordGraph.getNode(wordString);
      if (wordNode) {
        wordNode.previouslyVisited = false;
      }
    });
    
    // Clear previouslyVisitedWords set
    this.previouslyVisitedWords.clear();
    
    // Set visitingWord to the new initial word
    this.visitingWord = initialWord;
    
    // Also update the history model
    this.history.reset(initialWord);
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

}
