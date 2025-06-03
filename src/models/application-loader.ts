import { makeAutoObservable, runInAction } from 'mobx';
import { AppState } from './app-state';
import { WordLoader } from './word-loader';
import { WordSayerInterface } from './word-sayer-interface';
import { DataFileFetcherInterface } from '../lib/data-fetching/data-file-fetcher-interface';
import { WordGraph } from './word-graph';
import { Word } from './word';
import localDevReviewState from '../data/local_dev/review-pronunciation-state.json';

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
  public readonly dataFileFetcher: DataFileFetcherInterface;

  // Word loader
  private readonly wordLoader: WordLoader;

  // Word sayer for audio functionality
  public readonly wordSayer: WordSayerInterface;

  constructor(wordSayer: WordSayerInterface, dataFileFetcher: DataFileFetcherInterface) {
    // Set version from environment or fallback
    this.version = process.env.APP_VERSION || 'development';

    // Store the required word sayer
    this.wordSayer = wordSayer;

    // Store the required data file fetcher
    this.dataFileFetcher = dataFileFetcher;

    // Initialize the word loader
    this.wordLoader = new WordLoader(this.dataFileFetcher);

    makeAutoObservable(this);

    // Begin loading immediately
    this.loadApplication();
  }

  /**
   * Get the initial word from URL parameter or random selection
   */
  private getInitialWord(wordGraph: WordGraph): string {
    // Check for ?word=... parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const wordParam = urlParams.get('word');
    
    if (wordParam) {
      // Try to find the specified word in the graph
      const specifiedWord = wordGraph.getWord(wordParam.toLowerCase());
      if (specifiedWord) {
        console.log(`Starting with specified word: ${wordParam}`);
        return wordParam.toLowerCase();
      } else {
        console.warn(`Specified word "${wordParam}" not found in word graph, using random word`);
      }
    }
    
    // Fall back to random word selection
    const wordStrings = Array.from(wordGraph.words);
    const randomWordString = wordStrings[Math.floor(Math.random() * wordStrings.length)];
    console.log(`Starting with random word: ${randomWordString}`);
    return randomWordString;
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
        // Initialize with specified word from URL parameter or random word
        if (wordGraph.words.size > 0) {
          const initialWordString = this.getInitialWord(wordGraph);

          // Create the app state with the loaded data and the injected WordSayer
          this.appState = new AppState(initialWordString, wordGraph, this.version, this.wordSayer);

          // In local dev mode, load the review pronunciation state
          this.loadLocalDevReviewState();

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

        if (error instanceof Error) {
          // Use the error message
          this.errorMessage = error.message;
        } else {
          // Fallback for unknown error types
          this.errorMessage = 'Unknown error loading application';
        }
      });
    }
  }

  /**
   * Load review pronunciation state in local development mode
   */
  private loadLocalDevReviewState(): void {
    // Only load in local dev mode (version ends with '+' in development)
    if (!this.version.endsWith('+') || !this.appState) {
      return;
    }

    try {
      // Import the local dev review state directly
      runInAction(() => {
        if (this.appState) {
          this.appState.reviewPronunciationInteraction.setReviewState(localDevReviewState);
        }
      });
      console.log('Loaded local dev review state with', localDevReviewState.reviewed?.length || 0, 'reviewed words and', localDevReviewState.soundsWrong?.length || 0, 'wrong words');
    } catch (error) {
      // Silently ignore errors loading local dev review state
      console.log('Could not load local dev review state:', error);
    }
  }

}
