import { makeAutoObservable, computed } from 'mobx';
import { AppState } from './AppState';

/**
 * Model for the Reset page interaction
 */
export class ResetInteraction {
  // The filter text entered by the user
  filter: string = '';
  
  // Whether to match only words that start with the filter
  matchStartOnly: boolean = true;
  
  // Reference to the app state
  appState: AppState;
  
  constructor(appState: AppState) {
    this.appState = appState;
    makeAutoObservable(this, {
      filteredWords: computed
    });
  }
  
  /**
   * Get the filtered list of words based on current filter settings
   */
  get filteredWords(): string[] {
    if (!this.filter) {
      // Return all words if no filter is set
      return this.appState.wordGraph.sortedWords;
    }
    
    const lowerFilter = this.filter.toLowerCase();
    
    if (this.matchStartOnly) {
      // Filter words that start with the filter text
      return this.appState.wordGraph.sortedWords.filter(word => 
        word.toLowerCase().startsWith(lowerFilter)
      );
    } else {
      // Filter words that contain the filter text
      return this.appState.wordGraph.sortedWords.filter(word => 
        word.toLowerCase().includes(lowerFilter)
      );
    }
  }
  
  /**
   * Set a new filter text
   */
  setFilter(newFilter: string): void {
    this.filter = newFilter;
  }
  
  /**
   * Toggle the matchStartOnly setting
   */
  toggleMatchStartOnly(): void {
    this.matchStartOnly = !this.matchStartOnly;
  }
  
  /**
   * Choose a random word from the current filtered list
   */
  chooseRandom(): void {
    const filteredWords = this.filteredWords;
    if (filteredWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredWords.length);
      this.setNewWord(filteredWords[randomIndex]);
    }
  }
  
  /**
   * Set a new word as the current word and reset the history
   */
  setNewWord(word: string): void {
    // Reset the history with the new word
    this.appState.history.reset(word);
    
    // Set the new word as current
    this.appState.setNewWord(word);
    
    // Navigate back to the word view
    this.appState.navigateTo('wordView');
  }
}