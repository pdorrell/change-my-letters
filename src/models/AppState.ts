import { makeAutoObservable, computed } from 'mobx';
import { History } from './History';
import { WordGraph } from './WordGraph';
import { WordInteraction } from './interaction/WordInteraction';
import { WordSayerInterface } from './WordSayerInterface';
import { ResetInteraction } from './ResetInteraction';
import { ReviewPronunciationInteraction } from './ReviewPronunciationInteraction';
import { MenuManager } from './MenuManager';
import { Word } from './Word';
import { ButtonAction } from '../lib/ui/actions';

// Type for the main application pages
type AppPage = 'wordView' | 'historyView' | 'resetView' | 'reviewPronunciationView';

// Page configuration with labels for navigation
interface PageConfig {
  label: string;
  tooltip: string;
}

const PAGE_CONFIGS: Record<AppPage, PageConfig> = {
  wordView: { label: 'Word', tooltip: 'Change letters of a word' },
  resetView: { label: 'Reset...', tooltip: 'Choose a new word to start again' },
  historyView: { label: 'History', tooltip: 'View history' },
  reviewPronunciationView: { label: 'Pronunciation', tooltip: 'Review pronunciation of words' }
};

/**
 * Main application state that manages the current page and models
 */
export class AppState {
  // The current page being displayed
  currentPage: AppPage = 'wordView';
  
  // The current sub-header (null for main word view)
  subHeader: string | null = null;

  // The current word interaction model
  currentWord: WordInteraction;

  // The word history model
  history: History;

  // Current word being visited
  visitingWord: Word;

  // Set of previously visited words
  previouslyVisitedWords: Set<string> = new Set();
  
  // Reset word interaction model
  resetInteraction: ResetInteraction;

  // Review pronunciation interaction model
  reviewPronunciationInteraction: ReviewPronunciationInteraction;

  // Menu state management
  menuManager: MenuManager;

  // Audio settings
  sayImmediately: boolean = true;

  // Button actions
  resetAction: ButtonAction;
  sayAction: ButtonAction;
  reviewPronunciationAction: ButtonAction;

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

    // Initialize review pronunciation interaction
    this.reviewPronunciationInteraction = new ReviewPronunciationInteraction(
      this.wordGraph.sortedWords,
      this.wordSayer
    );

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
    this.history = new History(this, wordNode);

    // Initialize the current word with the menu manager
    this.currentWord = new WordInteraction(wordNode, this.newWordHandler, this.wordSayer, this.menuManager);

    // Initialize button actions
    this.resetAction = new ButtonAction(() => this.resetGame(), { tooltip: "Choose a new word" });
    this.sayAction = new ButtonAction(() => this.currentWord.say(), { tooltip: "Say the current word" });
    this.reviewPronunciationAction = new ButtonAction(() => this.navigateTo('reviewPronunciationView'), { tooltip: "Review pronunciation" });

    // Preload the initial word's audio
    this.wordSayer.preload(initialWord);

    makeAutoObservable(this, {
      undoAction: computed,
      redoAction: computed,
      toggleViewAction: computed,
      newWordHandler: computed
    });
  }

  /**
   * Get a handler function for setting new words
   */
  get newWordHandler(): (word: Word) => void {
    return (word: Word) => this.setNewWord(word);
  }

  /**
   * Set the current word without adding to history
   * @param wordObj The Word object to set as the current word
   */
  setCurrentWord(wordObj: Word): void {
    // Get the word string value
    const word = wordObj.word;

    // Mark current visiting word as visited and add to the set
    if (this.visitingWord) {
      this.visitingWord.previouslyVisited = true;
      this.previouslyVisitedWords.add(this.visitingWord.word);
    }

    // Update visitingWord to the new word
    this.visitingWord = wordObj;

    // Update the current word
    this.currentWord.updateWord(wordObj);

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

  /**
   * Set a new word and add it to history
   * @param wordObj The Word object to set as the new current word
   */
  setNewWord(wordObj: Word): void {
    // Add the new word to history first
    this.history.addWord(wordObj);
    
    // Then set it as the current word
    this.setCurrentWord(wordObj);
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
      // Set the current word without adding to history (since we're navigating through history)
      this.setCurrentWord(prevWordObj);
    }
  }

  /**
   * Redo a previously undone word change
   */
  redo(): void {
    // Get next word from history
    const nextWordObj = this.history.redo();
    if (nextWordObj) {
      // Set the current word without adding to history (since we're navigating through history)
      this.setCurrentWord(nextWordObj);
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
    
    // Update the current word interaction
    this.currentWord.updateWord(initialWord);
    
    // Also update the history model
    this.history.reset(initialWord);
  }


  /**
   * Navigate to a page
   */
  navigateTo(page: AppPage): void {
    this.currentPage = page;
    
    // Remove sub-header since we're using header navigation now
    this.subHeader = null;
    
    // If navigating to the reset view, reset the interaction state
    if (page === 'resetView') {
      this.resetInteraction.reset();
    }
    
    // If navigating to the review pronunciation view, reset the interaction state
    if (page === 'reviewPronunciationView') {
      this.reviewPronunciationInteraction.reset();
    }
  }

  /**
   * Get all pages in navigation order with their config
   */
  get allPages(): Array<{ page: AppPage; label: string; tooltip: string; isActive: boolean }> {
    const pageOrder: AppPage[] = ['wordView', 'resetView', 'historyView', 'reviewPronunciationView'];
    return pageOrder.map(page => ({
      page,
      label: PAGE_CONFIGS[page].label,
      tooltip: PAGE_CONFIGS[page].tooltip,
      isActive: page === this.currentPage
    }));
  }

  /**
   * Toggle between word view and history view
   */
  toggleView(): void {
    this.navigateTo(this.currentPage === 'wordView' ? 'historyView' : 'wordView');
  }

  /**
   * Get the undo action - updating the handler based on history state
   */
  get undoAction(): ButtonAction {
    const handler = this.history.canUndo ? () => this.undo() : null;
    return new ButtonAction(handler, { tooltip: "Undo last change" });
  }

  /**
   * Get the redo action - updating the handler based on history state
   */
  get redoAction(): ButtonAction {
    const handler = this.history.canRedo ? () => this.redo() : null;
    return new ButtonAction(handler, { tooltip: "Redo last undone change" });
  }

  /**
   * Get the toggle view action with appropriate tooltip based on current page
   */
  get toggleViewAction(): ButtonAction {
    const tooltip = this.currentPage === 'wordView' ? "View history" : "Back to word";
    return new ButtonAction(() => this.toggleView(), { tooltip });
  }
}
