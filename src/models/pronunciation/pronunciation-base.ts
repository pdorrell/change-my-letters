import { makeObservable, observable, computed, action } from 'mobx';
import { Word } from '@/models/Word';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { ButtonAction } from '@/lib/models/actions';
import { Filter } from '@/lib/models/filter';

/**
 * Base class for pronunciation interactions
 */
export abstract class PronunciationBase {
  // Filter settings
  filter: Filter;

  // Current review word
  currentWord: Word | null = null;

  // Autoplay state
  autoplaying: boolean = false;
  autoPlayWaitMillis: number = 100;
  private autoplayTimeoutId: number | null = null;

  // Words map for quick lookup
  protected wordsMap: Map<string, Word>;

  constructor(
    public readonly sortedWords: Word[],
    public readonly wordSayer: WordSayerInterface
  ) {
    // Initialize filter
    this.filter = new Filter('start');

    // Create words map for efficient lookup
    this.wordsMap = new Map();
    for (const word of sortedWords) {
      this.wordsMap.set(word.word, word);
    }

    makeObservable(this, {
      currentWord: observable,
      autoplaying: observable,
      autoPlayWaitMillis: observable,
      filteredWords: computed,
      displayedWords: computed,
      currentWordIndex: computed,
      autoplayAction: computed,
      setAutoPlayWaitMillis: action,
      setFilterValue: action,
      setFilterMatchOption: action,
      gotoNextWord: action,
      gotoPreviousWord: action,
      startAutoplay: action,
      stopAutoplay: action
    });
  }

  get filteredWords(): Word[] {
    // Get word strings and apply text filter
    const wordStrings = this.sortedWords.map(word => word.word);
    const textFiltered = this.filter.filtered(wordStrings);

    // Return Word objects that match the text filter
    return this.sortedWords.filter(word => textFiltered.includes(word.word));
  }

  get displayedWords(): Word[] {
    return this.filteredWords;
  }

  // Computed property for currentWordIndex
  get currentWordIndex(): number | null {
    if (!this.currentWord) return null;

    const filtered = this.filteredWords;
    const index = filtered.findIndex(word => word === this.currentWord);
    return index >= 0 ? index : null;
  }

  reset(): void {
    // Stop autoplay if running
    this.stopAutoplay();

    // Reset filter settings
    this.filter.value.set('');
    this.filter.matchOption.set('start');

    // Clear current review word
    if (this.currentWord) {
      this.currentWord.currentReview = false;
      this.currentWord = null;
    }
  }

  @action
  setAutoPlayWaitMillis(millis: number): void {
    this.autoPlayWaitMillis = millis;
  }

  @action
  setFilterValue(value: string): void {
    this.filter.value.set(value);
  }

  @action
  setFilterMatchOption(option: 'start' | 'end' | 'any'): void {
    this.filter.matchOption.set(option);
  }


  // Navigate to next word in filtered list
  @action
  async gotoNextWord(): Promise<void> {
    const filtered = this.filteredWords;
    if (filtered.length === 0) return;

    if (this.currentWordIndex === null) {
      // No word changer, start with first word
      await this.playWord(filtered[0]);
    } else if (this.currentWordIndex < filtered.length - 1) {
      // Move to next word
      const nextIndex = this.currentWordIndex + 1;
      await this.playWord(filtered[nextIndex]);
    } else {
      // At end of list, repeat word changer
      if (this.currentWord) {
        await this.wordSayer.say(this.currentWord.word);
      }
    }
  }

  // Navigate to previous word in filtered list
  @action
  async gotoPreviousWord(): Promise<void> {
    const filtered = this.filteredWords;
    if (filtered.length === 0) return;

    if (this.currentWordIndex === null) {
      // No word changer, start with last word
      await this.playWord(filtered[filtered.length - 1]);
    } else if (this.currentWordIndex > 0) {
      // Move to previous word
      const prevIndex = this.currentWordIndex - 1;
      await this.playWord(filtered[prevIndex]);
    } else {
      // At start of list, repeat word changer
      if (this.currentWord) {
        await this.wordSayer.say(this.currentWord.word);
      }
    }
  }

  // Start autoplay from next word (or first word if no word changer)
  @action
  startAutoplay(): void {
    this.autoplaying = true;
    this.autoplayNext();
  }

  // Stop autoplay
  @action
  stopAutoplay(): void {
    this.autoplaying = false;
    if (this.autoplayTimeoutId !== null) {
      clearTimeout(this.autoplayTimeoutId);
      this.autoplayTimeoutId = null;
    }
  }

  // Stop autoplay if it's running (used before calling playWord)
  stopAnyAutoplay(): void {
    if (this.autoplaying) {
      this.stopAutoplay();
    }
  }

  // Legacy method name for backward compatibility (calls stopAnyAutoplay + playWord)
  async reviewWord(word: Word): Promise<void> {
    this.stopAnyAutoplay();
    await this.playWord(word);
  }

  // Play a word (handles audio and sets current word)
  async playWord(word: Word): Promise<void> {
    // Set current word (subclass-specific implementation)
    this.setCurrentWord(word);

    // Say the word
    await this.wordSayer.say(word.word);
  }

  // Abstract method for setting current word (implemented by subclasses)
  protected abstract setCurrentWord(word: Word): void;

  // Move to next word in autoplay sequence
  private async autoplayNext(): Promise<void> {
    if (!this.autoplaying) return;

    const wordsToAutoplay = this.displayedWords; // Use displayedWords instead of filteredWords
    if (wordsToAutoplay.length === 0) {
      this.stopAutoplay();
      return;
    }

    // Find current word index in the displayed words
    let currentIndexInDisplayed: number | null = null;
    if (this.currentWord) {
      currentIndexInDisplayed = wordsToAutoplay.findIndex(word => word === this.currentWord);
      if (currentIndexInDisplayed === -1) {
        currentIndexInDisplayed = null; // Current word not in displayed list
      }
    }

    let nextIndex: number;
    if (currentIndexInDisplayed === null) {
      // No word changer in displayed list, start with first displayed word
      nextIndex = 0;
    } else if (currentIndexInDisplayed < wordsToAutoplay.length - 1) {
      // Move to next displayed word
      nextIndex = currentIndexInDisplayed + 1;
    } else {
      // Reached end of displayed list, stop autoplay
      this.stopAutoplay();
      return;
    }

    const nextWord = wordsToAutoplay[nextIndex];

    // Use playWord to handle the word change
    await this.playWord(nextWord);

    // Continue autoplay after the configured delay
    if (this.autoplaying) {
      this.autoplayTimeoutId = window.setTimeout(() => {
        this.autoplayNext();
      }, this.autoPlayWaitMillis);
    }
  }

  // Get the autoplay action button
  get autoplayAction(): ButtonAction {
    const handler = this.autoplaying
      ? () => this.stopAutoplay()
      : () => this.startAutoplay();
    const tooltip = this.autoplaying
      ? "Stop automatic word review"
      : "Start automatic word review";

    return new ButtonAction(handler, { tooltip });
  }
}
