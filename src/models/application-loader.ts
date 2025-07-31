import { makeAutoObservable, runInAction } from 'mobx';
import { AppState } from '@/models/app-state';
import { WordLoader } from '@/models/word-loader';
import { DataFileFetcherInterface } from '@/lib/data-fetching/data-file-fetcher-interface';
import { WordGraph } from '@/models/word-graph';
import { AudioFilePlayerInterface } from '@/models/audio/audio-file-player-interface';
// Using dynamic fetch for JSON to avoid Vite build issues

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

  // Audio file player for all audio functionality
  public readonly audioFilePlayer: AudioFilePlayerInterface;

  constructor(audioFilePlayer: AudioFilePlayerInterface, dataFileFetcher: DataFileFetcherInterface) {
    // Set version from environment or fallback
    this.version = process.env.APP_VERSION || 'development';

    // Store the required audio file player
    this.audioFilePlayer = audioFilePlayer;

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

          // Create the app state with the loaded data and the injected AudioFilePlayer
          this.appState = new AppState(initialWordString, wordGraph, this.version, this.audioFilePlayer);

          // In local dev mode, load the review pronunciation state (non-blocking)
          this.loadLocalDevReviewState().catch(error => 
            console.warn('Failed to load local dev review state:', error)
          );

          this.isLoading = false;
        } else {
          // If we couldn't load any words, display an error
          this.hasError = true;
          this.errorMessage = 'No words were loaded from the word graph';
          this.isLoading = false;
        }
      });
    } catch (error) {
      runInAction(() => {
        this.hasError = true;
        this.errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        this.isLoading = false;
      });
    }
  }

  /**
   * Load local dev review pronunciation state if available
   */
  private async loadLocalDevReviewState(): Promise<void> {
    try {
      // Only load in development environment
      if (process.env.NODE_ENV === 'development' && this.appState) {
        try {
          const response = await fetch('/src/data/local_dev/review-pronunciation-state.json');
          if (response.ok) {
            const localDevReviewState = await response.json();
            this.appState.reviewPronunciation.setReviewState(localDevReviewState);
          }
        } catch (fetchError) {
          console.warn('Could not fetch local dev review state:', fetchError);
        }
      }
    } catch (error) {
      console.warn('Could not load local dev review state:', error);
    }
  }
}
