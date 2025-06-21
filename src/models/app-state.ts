import { makeAutoObservable, computed } from 'mobx';
import { History } from '@/models/History';
import { WordGraph } from '@/models/word-graph';
import { WordInteraction } from '@/models/interaction/word-interaction';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { ResetInteraction } from '@/models/reset/reset-interaction';
import { ReviewPronunciationInteraction } from '@/models/review/review-pronunciation-interaction';
import { FindersInteraction } from '@/models/finders/finders-interaction';
import { WordChoiceFinderInteraction } from '@/models/finders/word-choice-finder/word-choice-finder-interaction';
import { WordsInRowFinder } from '@/models/finders/words-in-row-finder/words-in-row-finder';
import { MakeInteraction } from '@/models/make/make-interaction';
import { MenuManager } from '@/lib/views/menu-manager';
import { Word } from '@/models/Word';
import { ButtonAction } from '@/lib/models/actions';
import { ValueModel } from '@/lib/models/value-models';

// Type for the main application pages
type AppPage = 'word' | 'reset' | 'reviewPronunciation' | 'finders' | 'make' | 'reset/word' | 'reset/make';

// Page configuration with labels for navigation
interface PageConfig {
  label: string;
  tooltip: string;
}

const PAGE_CONFIGS: Record<AppPage, PageConfig> = {
  word: { label: 'Word', tooltip: 'Change letters of a word' },
  reset: { label: 'Reset...', tooltip: 'Choose a new word to start again' },
  reviewPronunciation: { label: 'Pronunciation', tooltip: 'Review pronunciation of words' },
  finders: { label: 'Finders', tooltip: 'Find words by listening to them' },
  make: { label: 'Make', tooltip: 'Practice making specific words' },
  'reset/word': { label: 'Reset Word', tooltip: 'Choose a new word for the Word page' },
  'reset/make': { label: 'Reset Make', tooltip: 'Choose a new word for the Make page' }
};

/**
 * Main application state that manages the current page and models
 */
export class AppState {

  // The current page being displayed
  currentPage: AppPage = 'word';

  // The current sub-header (null for main word view)
  subHeader: string | null = null;

  // The word changer interaction model
  wordChanger: WordInteraction;

  // The word history model
  history: History;

  // word changer being visited
  visitingWord: Word;

  // Set of previously visited words
  previouslyVisitedWords: Set<string> = new Set();

  // Reset word interaction model
  resetInteraction: ResetInteraction;

  // Review pronunciation interaction model
  reviewPronunciationInteraction: ReviewPronunciationInteraction;

  // Finders interaction model
  findersInteraction: FindersInteraction;

  // Word Choice Finder interaction model
  wordChoiceFinderInteraction: WordChoiceFinderInteraction;

  // Words In Row Finder interaction model
  wordsInRowFinder: WordsInRowFinder;

  // Make interaction model
  makeInteraction: MakeInteraction;

  // Menu state management
  menuManager: MenuManager;

  // Audio settings
  sayImmediately: ValueModel<boolean>;

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
    public readonly wordSayer: WordSayerInterface,

    // Audio player for celebration words
    public readonly happyWordSayer: WordSayerInterface
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

    // Initialize finders interaction
    const allWords = this.wordGraph.sortedWords.map(word => word.word);
    const getRandomWords = () => this.getRandomWords(allWords, 10);
    this.findersInteraction = new FindersInteraction(
      this.wordSayer,
      this.happyWordSayer,
      getRandomWords
    );

    // Initialize word choice finder interaction with random words
    const randomWords = getRandomWords();
    this.wordChoiceFinderInteraction = new WordChoiceFinderInteraction(
      this.wordSayer,
      randomWords,
      getRandomWords,
      this.happyWordSayer
    );

    // Initialize words in row finder with random words
    this.wordsInRowFinder = new WordsInRowFinder(
      this.wordSayer,
      randomWords,
      getRandomWords,
      this.happyWordSayer
    );

    // Initialize the word changer
    const wordNode = this.wordGraph.getNode(initialWord);
    if (!wordNode) {
      throw new Error(`Word "${initialWord}" doesn't exist in the word graph`);
    }

    // Initialize make interaction
    this.makeInteraction = new MakeInteraction(
      this.wordSayer,
      this.wordGraph,
      wordNode
    );

    // Initialize menu manager first
    this.menuManager = new MenuManager(() => {
      if (this.wordChanger) {
        this.wordChanger.closeAllMenus();
      }
    });

    // Initialize visitingWord
    this.visitingWord = wordNode;

    // Initialize history with the initial word object
    this.history = new History(this, wordNode);

    // Initialize the word changer with the menu manager and history
    this.wordChanger = new WordInteraction(wordNode, this.newWordHandler, this.wordSayer, this.menuManager, this.history);

    // Initialize button actions
    this.resetAction = new ButtonAction(() => this.resetGame(), { tooltip: "Choose a new word" });
    this.sayAction = new ButtonAction(() => this.wordChanger.say(), { tooltip: "Say the word changer" });
    this.reviewPronunciationAction = new ButtonAction(() => this.navigateTo('reviewPronunciation'), { tooltip: "Review pronunciation" });

    // Preload the initial word's audio
    this.wordSayer.preload(initialWord);

    makeAutoObservable(this, {
      undoAction: computed,
      redoAction: computed,
      newWordHandler: computed
    });
  }

  /**
   * Get a handler function for setting new words
   */
  get newWordHandler(): (word: Word) => Promise<void> {
    return async (word: Word) => await this.setNewWord(word);
  }

  /**
   * Set the word changer without adding to history
   * @param wordObj The Word object to set as the word changer
   */
  async setWordChanger(wordObj: Word): Promise<void> {
    // Get the word string value
    const word = wordObj.word;

    // Mark current visiting word as visited and add to the set
    if (this.visitingWord) {
      this.visitingWord.previouslyVisited = true;
      this.previouslyVisitedWords.add(this.visitingWord.word);
    }

    // Update visitingWord to the new word
    this.visitingWord = wordObj;

    // Update the word changer
    this.wordChanger.updateWord(wordObj);

    // Close any open menus when the word changes
    this.menuManager.closeMenus();

    // Preload the word changer (in case it's not already loaded)
    this.wordSayer.preload(word);

    // Preload all possible next words
    const possibleNextWords = wordObj.possibleNextWords;
    for (const nextWord of possibleNextWords) {
      this.wordSayer.preload(nextWord);
    }

    // Handle audio playback
    if (this.sayImmediately.value) {
      // Play the new word changer
      await this.wordChanger.say();
    }
  }

  /**
   * Set a new word and add it to history
   * @param wordObj The Word object to set as the new word changer
   */
  async setNewWord(wordObj: Word): Promise<void> {
    // Add the new word to history first
    this.history.addWord(wordObj);

    // Then set it as the word changer
    await this.setWordChanger(wordObj);
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
      // Set the word changer without adding to history (since we're navigating through history)
      this.setWordChanger(prevWordObj);
    }
  }

  /**
   * Redo a previously undone word change
   */
  redo(): void {
    // Get next word from history
    const nextWordObj = this.history.redo();
    if (nextWordObj) {
      // Set the word changer without adding to history (since we're navigating through history)
      this.setWordChanger(nextWordObj);
    }
  }

  /**
   * Navigate to the reset word page
   */
  resetGame(): void {
    // Navigate to the reset view
    // (The filter reset happens in navigateTo)
    this.navigateTo('reset');
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

    // Update the word changer interaction
    this.wordChanger.updateWord(initialWord);

    // Also update the history model
    this.history.reset(initialWord);

    // Say the new word if sayImmediately is checked
    if (this.sayImmediately.value) {
      this.wordChanger.say();
    }
  }


  /**
   * Set the sayImmediately setting
   */
  setSayImmediately(value: boolean): void {
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
    if (page === 'reset' || page.startsWith('reset/')) {
      this.resetInteraction.reset();
      // Set the target page based on the route
      if (page === 'reset/word') {
        this.resetInteraction.setTargetPage('word');
      } else if (page === 'reset/make') {
        this.resetInteraction.setTargetPage('make');
      }
    }

    // If navigating to the review pronunciation view, reset the interaction state
    if (page === 'reviewPronunciation') {
      this.reviewPronunciationInteraction.reset();
    }

    // If navigating to the finders view, reset the interaction state
    if (page === 'finders') {
      // Note: we don't reset the finder interactions to preserve the current game state
    }
  }

  /**
   * Get all pages in navigation order with their config (excluding reset routes)
   */
  get allPages(): Array<{ page: AppPage; label: string; tooltip: string; isActive: boolean }> {
    const pageOrder: AppPage[] = ['word', 'make', 'reviewPronunciation', 'finders'];
    return pageOrder.map(page => ({
      page,
      label: PAGE_CONFIGS[page].label,
      tooltip: PAGE_CONFIGS[page].tooltip,
      isActive: page === this.currentPage
    }));
  }

  /**
   * Get the reset button action for the current page
   */
  get resetButtonAction(): ButtonAction | null {
    if (this.currentPage === 'word') {
      return new ButtonAction(() => this.navigateTo('reset/word'), { tooltip: 'Reset the Word page with a new word' });
    } else if (this.currentPage === 'make') {
      return new ButtonAction(() => this.navigateTo('reset/make'), { tooltip: 'Reset the Make page with a new word' });
    }
    return null;
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
   * Get a random selection of words from the word list
   */
  private getRandomWords(allWords: string[], count: number): string[] {
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, allWords.length));
  }

}
