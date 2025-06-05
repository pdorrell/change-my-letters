import { makeAutoObservable, computed } from 'mobx';
import { History } from './history';
import { WordGraph } from './word-graph';
import { WordInteraction } from './interaction/word-interaction';
import { WordSayerInterface } from './word-sayer-interface';
import { ResetInteraction } from './reset-interaction';
import { ReviewPronunciationInteraction } from './review-pronunciation-interaction';
import { FinderInteraction } from './finder-interaction';
import { MenuManager } from '../lib/views/menu-manager';
import { Word } from './word';
import { ButtonAction } from '../lib/models/actions';
import { ValueModel } from '../lib/models/value-models';
import { ScoreModel } from './score-model';

// Type for the main application pages
type AppPage = 'wordView' | 'resetView' | 'reviewPronunciationView' | 'finderView';

// Page configuration with labels for navigation
interface PageConfig {
  label: string;
  tooltip: string;
}

const PAGE_CONFIGS: Record<AppPage, PageConfig> = {
  wordView: { label: 'Word', tooltip: 'Change letters of a word' },
  resetView: { label: 'Reset...', tooltip: 'Choose a new word to start again' },
  reviewPronunciationView: { label: 'Pronunciation', tooltip: 'Review pronunciation of words' },
  finderView: { label: 'Finder', tooltip: 'Find words by listening to them' }
};

/**
 * Main application state that manages the current page and models
 */
export class AppState {
  // Base URL for word sayer MP3 files
  private readonly baseWordSayerUrl = '/assets/words/eleven_labs/';

  // Special celebration words for Make Me success
  private readonly celebrationWords: string[] = ['cool!!', 'wow!!', 'hooray!!', 'yes!!'];

  // Special negative phrases for Make Me failure
  private readonly negativePhrases: string[] = ['oh dear!', 'oh no!', 'whoops!'];

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

  // Finder interaction model
  finderInteraction: FinderInteraction;

  // Menu state management
  menuManager: MenuManager;

  // Audio settings
  sayImmediately: ValueModel<boolean>;

  // Button actions
  resetAction: ButtonAction;
  sayAction: ButtonAction;
  reviewPronunciationAction: ButtonAction;

  // Make Me feature
  makeMeWord: Word | null = null;
  makeMeScore: ScoreModel;

  constructor(
    initialWord: string,

    // The word graph model containing possible word connections
    public readonly wordGraph: WordGraph,

    // Application version
    public readonly version: string,

    // Audio player for word pronunciation
    public readonly wordSayer: WordSayerInterface,

    // Audio player for celebration words
    public readonly happyWordSayer: WordSayerInterface,

    // Audio player for negative phrases
    public readonly sadWordSayer: WordSayerInterface
  ) {

    // Initialize audio settings
    this.sayImmediately = new ValueModel(true, 'Say Immediately', 'Automatically pronounce words when they change');

    // Initialize reset interaction
    this.resetInteraction = new ResetInteraction(this);

    // Initialize review pronunciation interaction
    this.reviewPronunciationInteraction = new ReviewPronunciationInteraction(
      this.wordGraph.sortedWords,
      this.wordSayer
    );

    // Initialize finder interaction with random words
    const allWords = this.wordGraph.sortedWords.map(word => word.word);
    const randomWords = this.getRandomWords(allWords, 10);
    this.finderInteraction = new FinderInteraction(
      this.wordSayer,
      randomWords,
      () => this.getRandomWords(allWords, 10),
      this.happyWordSayer
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

    // Initialize the current word with the menu manager and history
    this.currentWord = new WordInteraction(wordNode, this.newWordHandler, this.wordSayer, this.menuManager, this.history);

    // Initialize Make Me score with label
    this.makeMeScore = new ScoreModel(['"Make Me"', 'Score']);

    // Initialize button actions
    this.resetAction = new ButtonAction(() => this.resetGame(), { tooltip: "Choose a new word" });
    this.sayAction = new ButtonAction(() => this.currentWord.say(), { tooltip: "Say the current word" });
    this.reviewPronunciationAction = new ButtonAction(() => this.navigateTo('reviewPronunciationView'), { tooltip: "Review pronunciation" });

    // Preload the initial word's audio
    this.wordSayer.preload(initialWord);

    makeAutoObservable(this, {
      undoAction: computed,
      redoAction: computed,
      newWordHandler: computed,
      makeMeButtonAction: computed
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

    // Handle Make Me scoring and audio if there's an active Make Me word
    const hadMakeMeWord = this.makeMeWord !== null;
    let isCorrectMakeMeWord = false;
    if (this.makeMeWord) {
      // Check if the new word matches the Make Me word
      if (wordObj.word === this.makeMeWord.word) {
        this.makeMeScore.incrementCorrect();
        isCorrectMakeMeWord = true;
      } else {
        this.makeMeScore.incrementIncorrect();
      }
      // Clear the Make Me word since the user has made a change
      this.makeMeWord = null;
    }

    // Handle audio playback based on the new logic
    if (hadMakeMeWord && isCorrectMakeMeWord) {
      // Play a random celebration word for successful Make Me
      const randomIndex = Math.floor(Math.random() * this.celebrationWords.length);
      const celebrationWord = this.celebrationWords[randomIndex];
      this.happyWordSayer.say(celebrationWord);
    } else if (hadMakeMeWord && !isCorrectMakeMeWord) {
      // Play a random negative phrase followed by the new word after 0.2 seconds
      const randomIndex = Math.floor(Math.random() * this.negativePhrases.length);
      const negativePhrase = this.negativePhrases[randomIndex];
      this.sadWordSayer.say(negativePhrase, () => {
        // Wait 0.2 seconds then say the new word
        setTimeout(() => {
          this.currentWord.say();
        }, 200);
      });
    } else if (this.sayImmediately.value) {
      // Play the new current word
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

    // Clear Make Me state
    this.makeMeWord = null;
    this.makeMeScore.reset();

    // Set visitingWord to the new initial word
    this.visitingWord = initialWord;

    // Update the current word interaction
    this.currentWord.updateWord(initialWord);

    // Also update the history model
    this.history.reset(initialWord);
  }


  /**
   * Set the sayImmediately setting
   */
  setSayImmediately(value: boolean): void {
    console.debug("setSayImmediately value = ", value);
    this.sayImmediately.set(value);
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

    // If navigating to the finder view, reset the interaction state
    if (page === 'finderView') {
      // Note: we don't reset the finder interaction to preserve the current game state
    }
  }

  /**
   * Get all pages in navigation order with their config
   */
  get allPages(): Array<{ page: AppPage; label: string; tooltip: string; isActive: boolean }> {
    const pageOrder: AppPage[] = ['wordView', 'resetView', 'reviewPronunciationView', 'finderView'];
    return pageOrder.map(page => ({
      page,
      label: PAGE_CONFIGS[page].label,
      tooltip: PAGE_CONFIGS[page].tooltip,
      isActive: page === this.currentPage
    }));
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
   * Get the Make Me button action - always enabled, changes color when active
   */
  get makeMeButtonAction(): ButtonAction {
    const handler = () => this.makeMeSay();
    return new ButtonAction(handler, { tooltip: "Choose a random word for me to make" });
  }

  /**
   * Choose a random word from possible next words and say it, or repeat the current Make Me word
   */
  makeMeSay(): void {
    // If makeMeWord already exists, just say it again
    if (this.makeMeWord) {
      this.wordSayer.say(this.makeMeWord.word);
      return;
    }

    // Otherwise, choose a new Make Me word
    const possibleWords = this.visitingWord.possibleNextWords;
    if (possibleWords.length === 0) {
      return;
    }

    // Filter for unvisited words first, if any exist
    const unvisitedWords = possibleWords.filter(wordString => {
      const wordNode = this.wordGraph.getNode(wordString);
      return wordNode && !wordNode.previouslyVisited;
    });

    // Choose from unvisited words if available, otherwise from all possible words
    const candidateWords = unvisitedWords.length > 0 ? unvisitedWords : possibleWords;

    // Randomly select a word
    const randomIndex = Math.floor(Math.random() * candidateWords.length);
    const selectedWordString = candidateWords[randomIndex];
    const selectedWord = this.wordGraph.getNode(selectedWordString);

    if (selectedWord) {
      this.makeMeWord = selectedWord;

      // Say the selected word
      this.wordSayer.say(selectedWordString);
    }
  }

  /**
   * Get a random selection of words from the word list
   */
  private getRandomWords(allWords: string[], count: number): string[] {
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, allWords.length));
  }

}
