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
import { AudioFilePlayerInterface } from '@/models/audio/audio-file-player-interface';
import { WordSayer } from '@/models/word-sayer';
import { EmotionalWordPlayer } from '@/models/audio/emotional-word-player';
import { EmotionWordSet, HappyOrSad } from '@/models/audio/emotion-types';
import { EmotionalWordSayer } from '@/models/audio/emotional-word-sayer';

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

  // Menu manager for closing menus when actions occur
  menuManager: MenuManager;

  // The word we're currently visiting (may differ from word changer due to undo/redo)
  visitingWord: Word;

  // Set of previously visited words
  previouslyVisitedWords: Set<string> = new Set();

  // The reset interaction model
  resetInteraction: ResetInteraction;

  // The review pronunciation interaction model
  reviewPronunciationInteraction: ReviewPronunciationInteraction;

  // The finders interaction model
  findersInteraction: FindersInteraction;

  // The word choice finder interaction model
  wordChoiceFinderInteraction: WordChoiceFinderInteraction;

  // The words in row finder interaction model
  wordsInRowFinder: WordsInRowFinder;

  // The make interaction model
  makeInteraction: MakeInteraction;

  // Audio settings
  sayImmediately: ValueModel<boolean>;

  // Button actions
  resetAction: ButtonAction;
  sayAction: ButtonAction;
  reviewPronunciationAction: ButtonAction;

  // Audio file player for all audio functionality
  public readonly audioFilePlayer: AudioFilePlayerInterface;

  // Word sayer for regular word pronunciation
  public readonly wordSayer: WordSayerInterface;

  // Emotional word player for happy/sad words
  public readonly emotionalWordPlayer: EmotionalWordPlayer<HappyOrSad>;

  // Happy word sayer wrapper
  public readonly happyWordSayer: WordSayerInterface;

  // Sad word sayer wrapper
  public readonly sadWordSayer: WordSayerInterface;

  constructor(
    initialWord: string,

    // The word graph model containing possible word connections
    public readonly wordGraph: WordGraph,

    // Application version
    public readonly version: string,

    // Audio file player for all audio functionality
    audioFilePlayer: AudioFilePlayerInterface
  ) {
    // Store the audio file player
    this.audioFilePlayer = audioFilePlayer;

    // Create word sayer for regular words
    this.wordSayer = new WordSayer(audioFilePlayer, 'words');

    // Create emotional word player with happy and sad word sets
    const happyWords = ['cool!!', 'wow!!', 'hooray!!', 'yes!!'];
    const sadWords = ['oh dear!', 'oh no!', 'whoops!'];
    const emotionWordSets = [
      new EmotionWordSet<HappyOrSad>('happy', happyWords),
      new EmotionWordSet<HappyOrSad>('sad', sadWords)
    ];
    this.emotionalWordPlayer = new EmotionalWordPlayer(audioFilePlayer, emotionWordSets);

    // Create emotional word sayer wrappers
    this.happyWordSayer = new EmotionalWordSayer(this.emotionalWordPlayer, 'happy');
    this.sadWordSayer = new EmotionalWordSayer(this.emotionalWordPlayer, 'sad');

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
      this.sadWordSayer,
      getRandomWords
    );

    // Initialize word choice finder interaction with random words
    const randomWords = getRandomWords();
    this.wordChoiceFinderInteraction = new WordChoiceFinderInteraction(
      this.wordSayer,
      randomWords,
      getRandomWords,
      this.happyWordSayer,
      this.sadWordSayer
    );

    // Initialize words in row finder with random words
    this.wordsInRowFinder = new WordsInRowFinder(
      this.wordSayer,
      randomWords,
      getRandomWords,
      this.sadWordSayer
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

    // Preload all emotional words
    this.emotionalWordPlayer.preload();

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

  /**
   * Get random words from the word list
   * @param words Array of all available words
   * @param count Number of words to return
   * @returns Array of random words
   */
  getRandomWords(words: string[], count: number): string[] {
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Reset the game with a new word
   */
  resetGame(): void {
    this.navigateTo('reset');
  }

  /**
   * Navigate to a specific page
   * @param page The page to navigate to
   */
  navigateTo(page: AppPage): void {
    this.currentPage = page;

    // Reset review pronunciation interaction when navigating to it
    if (page === 'reviewPronunciation') {
      this.reviewPronunciationInteraction.reset();
    }
  }

  /**
   * Get the current page configuration
   */
  get currentPageConfig(): PageConfig {
    return PAGE_CONFIGS[this.currentPage];
  }

  /**
   * Get all available pages with their configuration
   */
  get allPages(): Array<{ page: AppPage; config: PageConfig; isActive: boolean }> {
    const pages: AppPage[] = ['word', 'reset', 'reviewPronunciation', 'finders', 'make'];
    return pages.map(page => ({
      page,
      config: PAGE_CONFIGS[page],
      isActive: page === this.currentPage
    }));
  }

  /**
   * Get undo action (computed)
   */
  get undoAction(): ButtonAction | null {
    return this.history.canUndo ? new ButtonAction(() => this.history.undo(), { tooltip: "Undo" }) : null;
  }

  /**
   * Get redo action (computed)
   */
  get redoAction(): ButtonAction | null {
    return this.history.canRedo ? new ButtonAction(() => this.history.redo(), { tooltip: "Redo" }) : null;
  }

  /**
   * Reset the application with a new starting word
   * @param wordObj The new word to start with
   */
  async reset(wordObj: Word): Promise<void> {
    // Clear the visited words set
    this.previouslyVisitedWords.clear();

    // Reset history with the new word
    this.history.reset(wordObj);

    // Set the new word as the current word changer
    await this.setWordChanger(wordObj);
  }
}
