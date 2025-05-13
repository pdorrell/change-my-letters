import { makeAutoObservable, runInAction } from 'mobx';
import { CurrentWord } from './CurrentWord';
import { HistoryModel, WordChange } from './HistoryModel';
import { WordGraph } from './WordGraph';
import { WordLoader } from './WordLoader';

// Type for the main application pages
type AppPage = 'wordView' | 'historyView';

/**
 * Main application state that manages the current page and models
 */
export class AppState {
  // The current page being displayed
  currentPage: AppPage = 'wordView';
  
  // The current word model
  currentWord: CurrentWord;
  
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
    this.currentWord = new CurrentWord(initialWord, this);
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
          // This would be visible in the main UI where we show "Loading..." normally
          this.isLoading = false;
          // We could set some error state here if needed
        }
        
        this.updateCurrentWordState();
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
   * Update the current word's state based on the word graph
   */
  updateCurrentWordState(): void {
    const word = this.currentWord.value;
    
    // Update whether the word has been previously visited
    this.currentWord.previouslyVisited = this.history.hasVisited(word);
    
    // Update letter states
    for (let i = 0; i < this.currentWord.letters.length; i++) {
      const letter = this.currentWord.letters[i];
      
      // Check if this letter can be deleted
      letter.canDelete = this.wordGraph.canDeleteLetterAt(word, i);
      
      // Check if this letter can be replaced and get possible replacements
      const replacements = this.wordGraph.getPossibleReplacements(word, i);
      letter.canReplace = replacements.length > 0;
      letter.replacements = replacements;
      
      // Check if this letter can change case
      letter.canUpperCase = this.wordGraph.canChangeCaseAt(word, i) && 
                            letter.value === letter.value.toLowerCase() && 
                            letter.value !== letter.value.toUpperCase();
      
      letter.canLowerCase = this.wordGraph.canChangeCaseAt(word, i) && 
                           letter.value === letter.value.toUpperCase() && 
                           letter.value !== letter.value.toLowerCase();
    }
    
    // Update position states
    for (let i = 0; i < this.currentWord.positions.length; i++) {
      const position = this.currentWord.positions[i];
      
      // Check if a letter can be inserted at this position
      const insertions = this.wordGraph.getPossibleInsertions(word, i);
      position.canInsert = insertions.length > 0;
      position.insertOptions = insertions;
    }
  }
  
  
  /**
   * Set a new current word
   */
  setNewWord(word: string): void {
    // If the current word object doesn't exist yet, create it
    if (!this.currentWord) {
      this.currentWord = new CurrentWord(word, this);
    } else {
      this.currentWord.updateWord(word);
    }
    this.updateCurrentWordState();

    // Close any open menus when the word changes
    this.closeAllMenus();
  }
  
  /**
   * Delete a letter from the current word
   */
  deleteLetter(position: number): void {
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
    if (menuType === 'replace' && position >= 0 && position < this.currentWord.letters.length) {
      this.currentWord.letters[position].isReplaceMenuOpen = true;
    } else if (menuType === 'insert' && position >= 0 && position <= this.currentWord.letters.length) {
      this.currentWord.positions[position].isInsertMenuOpen = true;
    }
  }
  
  /**
   * Close all menus
   */
  closeAllMenus(): void {
    // Close existing open menu
    if (this.activeMenuType === 'replace' && this.activeMenuPosition >= 0) {
      if (this.activeMenuPosition < this.currentWord.letters.length) {
        this.currentWord.letters[this.activeMenuPosition].isReplaceMenuOpen = false;
      }
    } else if (this.activeMenuType === 'insert' && this.activeMenuPosition >= 0) {
      if (this.activeMenuPosition < this.currentWord.positions.length) {
        this.currentWord.positions[this.activeMenuPosition].isInsertMenuOpen = false;
      }
    }
    
    this.activeMenuType = 'none';
    this.activeMenuPosition = -1;
    this.activeButtonElement = null;
  }
}