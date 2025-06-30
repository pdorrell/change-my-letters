import { makeAutoObservable, computed } from 'mobx';
import { WordGraph } from '@/models/word-graph';
import { WordChanger } from '@/models/changer/word-changer';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { ResetInteraction } from '@/models/reset/reset';
import { PronunciationInteraction } from '@/models/pronunciation/pronunciation';
import { FindersInteraction } from '@/models/finders/finders';
import { WordChoiceFinderInteraction } from '@/models/finders/word-choice-finder/word-choice-finder';
import { WordsInRowFinder } from '@/models/finders/words-in-row-finder/words-in-row-finder';
import { MakerInteraction } from '@/models/maker/maker';
import { Word } from '@/models/Word';
import { ButtonAction } from '@/lib/models/actions';
import { AudioFilePlayerInterface } from '@/models/audio/audio-file-player-interface';
import { WordSayer } from '@/models/word-sayer';
import { EmotionalWordSayer } from '@/models/audio/emotional-word-sayer';
import { EmotionWordSet, HappyOrSad } from '@/models/audio/emotion-types';

// Type for pages that can be reset
export type ResettableAppPage = 'make' | 'changer';

// Type for the main application pages
type AppPage = ResettableAppPage | 'reviewPronunciation' | 'finders' | 'reset/changer' | 'reset/make';

// Page configuration with labels for navigation
interface PageConfig {
  label: string;
  tooltip: string;
}

const PAGE_CONFIGS: Record<AppPage, PageConfig> = {
  changer: { label: 'Changer', tooltip: 'Change letters of a word' },
  reviewPronunciation: { label: 'Pronunciation', tooltip: 'Pronunciation of words' },
  finders: { label: 'Finders', tooltip: 'Find words by listening to them' },
  make: { label: 'Make', tooltip: 'Practice making specific words' },
  'reset/changer': { label: 'Reset Changer', tooltip: 'Choose a new word for the Changer page' },
  'reset/make': { label: 'Reset Make', tooltip: 'Choose a new word for the Make page' }
};

/**
 * Main application state that manages the current page and models
 */
export class AppState {

  // The current page being displayed
  currentPage: AppPage = 'changer';

  // The current sub-header (null for main word view)
  subHeader: string | null = null;

  // The word changer model
  wordChanger: WordChanger;

  // The reset interaction model
  resetInteraction: ResetInteraction;

  // The pronunciation interaction model
  pronunciationInteraction: PronunciationInteraction;

  // The finders interaction model
  findersInteraction: FindersInteraction;

  // The word choice finder interaction model
  wordChoiceFinderInteraction: WordChoiceFinderInteraction;

  // The words in row finder interaction model
  wordsInRowFinder: WordsInRowFinder;

  // The make interaction model
  makerInteraction: MakerInteraction;


  // Audio file player for all audio functionality
  public readonly audioFilePlayer: AudioFilePlayerInterface;

  // Word sayer for regular word pronunciation
  public readonly wordSayer: WordSayerInterface;

  // Emotional word sayer for happy/sad words
  public readonly emotionalWordSayer: EmotionalWordSayer<HappyOrSad>;

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
    this.emotionalWordSayer = new EmotionalWordSayer(audioFilePlayer, emotionWordSets);

    // Initialize reset interaction
    this.resetInteraction = new ResetInteraction(this);

    // Initialize pronunciation interaction
    this.pronunciationInteraction = new PronunciationInteraction(
      this.wordGraph.sortedWords,
      this.wordSayer
    );

    // Initialize finders interaction
    const allWords = this.wordGraph.sortedWords.map(word => word.word);
    const getRandomWords = () => this.getRandomWords(allWords, 10);
    this.findersInteraction = new FindersInteraction(
      this.wordSayer,
      this.emotionalWordSayer,
      getRandomWords
    );

    // Initialize word choice finder interaction with random words
    const wordChoiceRandomWords = getRandomWords();
    this.wordChoiceFinderInteraction = new WordChoiceFinderInteraction(
      this.wordSayer,
      wordChoiceRandomWords,
      getRandomWords,
      this.emotionalWordSayer
    );

    // Initialize words in row finder with separate random words
    const wordsInRowRandomWords = getRandomWords();
    this.wordsInRowFinder = new WordsInRowFinder(
      this.wordSayer,
      wordsInRowRandomWords,
      getRandomWords,
      this.emotionalWordSayer
    );

    // Initialize the word changer
    const wordNode = this.wordGraph.getNode(initialWord);
    if (!wordNode) {
      throw new Error(`Word "${initialWord}" doesn't exist in the word graph`);
    }

    // Initialize make interaction
    this.makerInteraction = new MakerInteraction(
      this.wordSayer,
      this.wordGraph,
      wordNode
    );

    // Initialize the word changer with the initial word
    this.wordChanger = new WordChanger(wordNode, this.wordSayer, this);

    // Preload all emotional words
    this.emotionalWordSayer.preload();

    makeAutoObservable(this, {
      resetAction: computed
    });
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
   * Reset the game with a new word - navigates to appropriate reset page based on current page
   */
  resetGame(): void {
    if (this.currentPage === 'make') {
      this.navigateTo('reset/make');
    } else if (this.currentPage === 'changer') {
      this.navigateTo('reset/changer');
    }
    // Do nothing if not on 'make' or 'changer' page
  }

  /**
   * Navigate to a specific page
   * @param page The page to navigate to
   */
  navigateTo(page: AppPage): void {
    this.currentPage = page;

    // Reset pronunciation interaction when navigating to it
    if (page === 'reviewPronunciation') {
      this.pronunciationInteraction.reset();
    }

    // Set reset interaction target page when navigating to reset pages
    if (page === 'reset/changer') {
      this.resetInteraction.setTargetPage('changer');
    } else if (page === 'reset/make') {
      this.resetInteraction.setTargetPage('make');
    }
  }

  /**
   * Get the current page configuration
   */
  get currentPageConfig(): PageConfig {
    return PAGE_CONFIGS[this.currentPage];
  }

  /**
   * Get pages that should appear in the navigation menu
   */
  get menuPages(): Array<{ page: AppPage; config: PageConfig; isActive: boolean }> {
    const pages: AppPage[] = ['changer', 'reviewPronunciation', 'finders', 'make'];
    return pages.map(page => ({
      page,
      config: PAGE_CONFIGS[page],
      isActive: page === this.currentPage
    }));
  }


  /**
   * Get reset action (computed) - only enabled on resettable pages
   */
  get resetAction(): ButtonAction {
    const resettablePages: ResettableAppPage[] = ['changer', 'make'];
    const enabled = resettablePages.includes(this.currentPage as ResettableAppPage);
    const handler = enabled ? () => this.resetGame() : null;
    return new ButtonAction(handler, { tooltip: "Choose a new word" });
  }

  /**
   * Reset the application with a new starting word
   * @param wordObj The new word to start with
   */
  async reset(wordObj: Word): Promise<void> {
    // Reset the word changer with the new word
    await this.wordChanger.reset(wordObj);
  }
}
