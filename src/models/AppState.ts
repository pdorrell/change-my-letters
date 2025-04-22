import { makeAutoObservable } from 'mobx';
import { CurrentWord } from './CurrentWord';

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
  
  constructor() {
    // Initial word - will be replaced with proper initialization
    this.currentWord = new CurrentWord('word');
    
    makeAutoObservable(this);
  }
  
  // Navigate to a different page
  navigateTo(page: AppPage): void {
    this.currentPage = page;
  }
}