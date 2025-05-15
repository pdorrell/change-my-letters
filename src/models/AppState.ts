import { makeAutoObservable, runInAction } from 'mobx';
import { HistoryModel, WordChange } from './HistoryModel';
import { WordGraph } from './WordGraph';
import { WordLoader } from './WordLoader';
import { WordInteraction } from './interaction/WordInteraction';

// Type for the main application pages
type AppPage = 'wordView' | 'historyView';

/**
 * Main application state that manages the current page and models
 */
export class AppState {
  // The current page being displayed
  currentPage: AppPage = 'wordView';
  
  // The current word interaction model
  currentWord: WordInteraction | null = null;
  
  // The word history model
  history: HistoryModel;
  
  // The word graph model containing possible word connections
  wordGraph: WordGraph;
  
  // Loading state
  isLoading: boolean = true;
  
  // Menu state management
  activeMenuType: 'none' | 'replace' | 'insert' = 'none';
  activeMenuPosition: number = -1;
  
  constructor() {
    // Initial word - will be replaced with proper initialization
    const initialWord = 'bet';
    this.history = new HistoryModel(this, initialWord);
    this.wordGraph = new WordGraph();

    makeAutoObservable(this);

    // Load the word graph
    this.loadWordGraph();
  }
  
  /**
   * Load the default word graph
   */
  async loadWordGraph(): Promise<void> {
    this.isLoading = true;
    
    try {
      const graph = await WordLoader.loadDefaultWordGraph();
      
      runInAction(() => {
        this.wordGraph = graph;
        
        // Initialize with a random word from the graph
        if (graph.words.size > 0) {
          const words = Array.from(graph.words);
          const randomWord = words[Math.floor(Math.random() * words.length)];
          this.setNewWord(randomWord);
        } else {
          // If we couldn't load any words, display an error status message
          this.isLoading = false;
        }
        
        this.isLoading = false;
      });
    } catch (error) {
      // Error is already reported to ErrorHandler in WordLoader class
      // Just update the UI state to show we're done loading
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
  
  /**
   * Set a new current word
   * @throws Error if the word doesn't exist in the graph
   */
  setNewWord(word: string): void {
    // Get the node for this word
    const node = this.wordGraph.getNode(word);
    
    if (!node) {
      throw new Error(`Word "${word}" doesn't exist in the word graph`);
    }
    
    // Check if the word has been visited before
    const hasBeenVisited = this.history.hasVisited(word);
    
    // Create or update the current word
    if (!this.currentWord) {
      this.currentWord = new WordInteraction(node, this, hasBeenVisited);
    } else {
      this.currentWord.updateWord(node, hasBeenVisited);
    }

    // Close any open menus when the word changes
    this.closeAllMenus();
  }
  
  /**
   * Delete a letter from the current word
   */
  deleteLetter(position: number): void {
    if (!this.currentWord) return;
    
    const currentWord = this.currentWord.value;
    
    if (position >= 0 && position < currentWord.length) {
      const newWord = currentWord.substring(0, position) + currentWord.substring(position + 1);
      
      // Check if the new word exists in our graph
      if (this.wordGraph.words.has(newWord)) {
        // Add to history
        const change: WordChange = {
          type: 'delete_letter',
          position
        };
        
        this.history.addWord(newWord, change);
        this.setNewWord(newWord);
      }
    }
  }
  
  /**
   * Insert a letter into the current word
   */
  insertLetter(position: number, letter: string): void {
    if (!this.currentWord) return;
    
    const currentWord = this.currentWord.value;
    
    if (position >= 0 && position <= currentWord.length) {
      const newWord = currentWord.substring(0, position) + letter + currentWord.substring(position);
      
      // Check if the new word exists in our graph
      if (this.wordGraph.words.has(newWord)) {
        // Add to history
        const change: WordChange = {
          type: 'insert_letter',
          position,
          letter
        };
        
        this.history.addWord(newWord, change);
        this.setNewWord(newWord);
      }
    }
  }
  
  /**
   * Replace a letter in the current word
   */
  replaceLetter(position: number, newLetter: string): void {
    if (!this.currentWord) return;
    
    const currentWord = this.currentWord.value;
    
    if (position >= 0 && position < currentWord.length) {
      const newWord = currentWord.substring(0, position) + newLetter + currentWord.substring(position + 1);
      
      // Check if the new word exists in our graph
      if (this.wordGraph.words.has(newWord)) {
        // Add to history
        const change: WordChange = {
          type: 'replace_letter',
          position,
          letter: newLetter
        };
        
        this.history.addWord(newWord, change);
        this.setNewWord(newWord);
      }
    }
  }
  
  /**
   * Change the case of a letter
   */
  changeLetterCase(position: number, toUpperCase: boolean): void {
    if (!this.currentWord) return;
    
    const currentWord = this.currentWord.value;
    
    if (position >= 0 && position < currentWord.length) {
      const letter = currentWord[position];
      const newLetter = toUpperCase ? letter.toUpperCase() : letter.toLowerCase();
      const newWord = currentWord.substring(0, position) + newLetter + currentWord.substring(position + 1);
      
      // Check if the new word exists in our graph
      if (this.wordGraph.words.has(newWord)) {
        // Add to history
        const change: WordChange = {
          type: toUpperCase ? 'upper_case_letter' : 'lower_case_letter',
          position
        };
        
        this.history.addWord(newWord, change);
        this.setNewWord(newWord);
      }
    }
  }
  
  /**
   * Undo the last word change
   */
  undo(): void {
    const prevWord = this.history.undo();
    if (prevWord) {
      this.setNewWord(prevWord);
    }
  }
  
  /**
   * Redo a previously undone word change
   */
  redo(): void {
    const nextWord = this.history.redo();
    if (nextWord) {
      this.setNewWord(nextWord);
    }
  }
  
  /**
   * Reset the game with a new random word
   */
  resetGame(): void {
    if (this.wordGraph.words.size > 0) {
      const words = Array.from(this.wordGraph.words);
      const randomWord = words[Math.floor(Math.random() * words.length)];
      
      this.history.reset(randomWord);
      this.setNewWord(randomWord);
    }
  }
  
  /**
   * Navigate to a page
   */
  navigateTo(page: AppPage): void {
    this.currentPage = page;
  }
  
  // Store the button element that triggered the menu
  activeButtonElement: HTMLElement | null = null;
  
  /**
   * Open a menu
   */
  openMenu(menuType: 'replace' | 'insert', position: number, buttonElement: HTMLElement): void {
    if (!this.currentWord) return;
    
    // If same menu, close it (toggle behavior)
    if (this.activeMenuType === menuType && this.activeMenuPosition === position) {
      this.closeAllMenus();
      return;
    }
    
    // Close any open menu first
    this.closeAllMenus();
    
    // Open the new menu
    this.activeMenuType = menuType;
    this.activeMenuPosition = position;
    this.activeButtonElement = buttonElement;
    
    // Set the corresponding menu state in the model
    if (menuType === 'replace' && position >= 0 && position < this.currentWord.letterInteractions.length) {
      this.currentWord.letterInteractions[position].isReplaceMenuOpen = true;
    } else if (menuType === 'insert' && position >= 0 && position <= this.currentWord.positionInteractions.length) {
      this.currentWord.positionInteractions[position].isInsertMenuOpen = true;
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
    this.activeMenuType = 'none';
    this.activeMenuPosition = -1;
    this.activeButtonElement = null;
  }
}