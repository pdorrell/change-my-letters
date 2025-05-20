import { makeAutoObservable, runInAction } from 'mobx';
import { AppState } from './AppState';
import { WordLoader } from './WordLoader';
import { WordSayer } from './WordSayer';
import { DataFileFetcherInterface } from './DataFileFetcherInterface';
import { DataFileFetcher } from './DataFileFetcher';
import { ErrorReport } from '../utils/ErrorReport';

/**
 * ApplicationLoader handles asynchronous loading of application data
 * and initialization of the main app state.
 */
export class ApplicationLoader {
  // Main application state, created after successful loading
  appState: AppState | null = null;
  
  // Loading state flag
  isLoading: boolean = true;
  
  // Error state
  hasError: boolean = false;
  errorMessage: string = '';
  
  // Application version from environment
  version: string;
  
  // Data file fetcher
  private readonly dataFileFetcher: DataFileFetcherInterface;
  
  // Word loader
  private readonly wordLoader: WordLoader;
  
  constructor(dataFileFetcher?: DataFileFetcherInterface) {
    // Set version from environment or fallback
    this.version = process.env.APP_VERSION || 'development';
    
    // Initialize the data file fetcher
    this.dataFileFetcher = dataFileFetcher || new DataFileFetcher();
    
    // Initialize the word loader
    this.wordLoader = new WordLoader(this.dataFileFetcher);
    
    makeAutoObservable(this);
    
    // Begin loading immediately
    this.loadApplication();
  }
  
  /**
   * Load the application data and initialize AppState
   */
  async loadApplication(): Promise<void> {
    this.isLoading = true;
    this.hasError = false;
    
    try {
      // Load the word graph
      const wordGraph = await this.wordLoader.loadDefaultWordGraph();
      
      runInAction(() => {
        // Initialize with a random word from the graph
        if (wordGraph.words.size > 0) {
          const words = Array.from(wordGraph.words);
          const randomWord = words[Math.floor(Math.random() * words.length)];
          
          // Create the app state with the loaded data and a new WordSayer
          this.appState = new AppState(randomWord, wordGraph, this.version, new WordSayer());
          this.isLoading = false;
        } else {
          // If we couldn't load any words, display an error
          this.hasError = true;
          this.errorMessage = 'No words found in word graph';
          this.isLoading = false;
        }
      });
    } catch (error) {
      runInAction(() => {
        this.hasError = true;
        this.isLoading = false;
        
        // Use error message directly if it's already an ErrorReport
        if (error instanceof ErrorReport) {
          this.errorMessage = error.message;
        } else if (error instanceof Error) {
          // For other errors, create an ErrorReport and use its message
          const errorReport = new ErrorReport('Error loading application', error);
          this.errorMessage = errorReport.message;
        } else {
          // Fallback for unknown error types
          this.errorMessage = 'Unknown error loading application';
        }
      });
    }
  }
  
}