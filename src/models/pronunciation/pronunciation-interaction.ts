import { makeAutoObservable, computed, action } from 'mobx';
import { Word } from '@/models/Word';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { ReviewStateFilterOption } from '@/models/pronunciation/review-state-filter-option';
import { ButtonAction } from '@/lib/models/actions';
import { ReviewState, getReviewStateFromJson } from '@/models/pronunciation/review-state';
import { Filter } from '@/lib/models/filter';

/**
 * Manages interactions for the Pronunciation page
 */
export class PronunciationInteraction {
  // Mode setting - review mode (developer tool) vs activity mode (for children)
  reviewMode: boolean = false;

  // Activity mode word display limit
  defaultMaxNumWordsToShow: number = 20;
  maxNumWordsToShow: number = this.defaultMaxNumWordsToShow;

  // Filter settings
  filter: Filter;
  reviewStateFilter: ReviewStateFilterOption = ReviewStateFilterOption.ALL;

  // Current review word
  currentReviewWord: Word | null = null;

  // Autoplay state
  autoplaying: boolean = false;
  autoPlayWaitMillis: number = 100;
  private autoplayTimeoutId: number | null = null;

  // Words map for quick lookup
  private wordsMap: Map<string, Word>;

  // Button actions
  loadStateAction: ButtonAction;
  saveStateAction: ButtonAction;
  downloadWrongWordsAction: ButtonAction;
  resetAllToUnreviewedAction: ButtonAction;
  resetAllToOKAction: ButtonAction;
  reviewWrongWordsAction: ButtonAction;

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

    // Initialize button actions
    this.loadStateAction = new ButtonAction(() => this.triggerFileUpload(), { tooltip: "Upload review-pronunciation-state.json" });
    this.saveStateAction = new ButtonAction(() => this.saveState(), { tooltip: "Download review-pronunciation-state.json" });
    this.downloadWrongWordsAction = new ButtonAction(() => this.downloadWrongWords(), { tooltip: "Download words-that-sound-wrong.txt" });
    this.resetAllToUnreviewedAction = new ButtonAction(() => this.resetAllToUnreviewed(), { tooltip: "Reset all words to unreviewed" });
    this.resetAllToOKAction = new ButtonAction(() => this.resetAllToOK(), { tooltip: "Reset all words to OK" });
    this.reviewWrongWordsAction = new ButtonAction(() => this.reviewWrongWords(), { tooltip: "Update review state so that only current 'wrong' words are to be reviewed" });

    makeAutoObservable(this, {
      filteredWords: computed,
      displayedWords: computed,
      hasMoreWords: computed,
      showMoreWordsAction: computed,
      reviewStateFilterOptions: computed,
      currentReviewWordIndex: computed,
      markOKAction: computed,
      markSoundsWrongAction: computed,
      autoplayAction: computed,
      resetMaxWordsAction: computed
    });
  }

  get reviewStateFilterOptions(): ReviewStateFilterOption[] {
    return ReviewStateFilterOption.options;
  }

  get filteredWords(): Word[] {
    // Apply review state filter first (only in review mode)
    const stateFiltered = this.reviewMode
      ? this.sortedWords.filter(word => this.reviewStateFilter.include(word))
      : this.sortedWords;

    // Get word strings and apply text filter
    const wordStrings = stateFiltered.map(word => word.word);
    const textFiltered = this.filter.filtered(wordStrings);

    // Return Word objects that match the text filter
    return stateFiltered.filter(word => textFiltered.includes(word.word));
  }

  get displayedWords(): Word[] {
    const filtered = this.filteredWords;
    // In activity mode, limit to maxNumWordsToShow
    return this.reviewMode ? filtered : filtered.slice(0, this.maxNumWordsToShow);
  }

  get hasMoreWords(): boolean {
    // True if there are more words beyond the displayed limit (activity mode only)
    return !this.reviewMode && this.filteredWords.length > this.maxNumWordsToShow;
  }

  get showMoreWordsAction(): ButtonAction {
    const additionalWords = this.filteredWords.length - this.maxNumWordsToShow;
    const wordsToShow = Math.min(additionalWords, this.maxNumWordsToShow);
    const tooltip = `Show ${wordsToShow} more words`;
    const handler = this.hasMoreWords ? () => this.showMoreWords() : null;
    return new ButtonAction(handler, { tooltip });
  }

  // Computed property for currentReviewWordIndex
  get currentReviewWordIndex(): number | null {
    if (!this.currentReviewWord) return null;

    const filtered = this.filteredWords;
    const index = filtered.findIndex(word => word === this.currentReviewWord);
    return index >= 0 ? index : null;
  }

  get markOKAction(): ButtonAction {
    const enabled = this.currentReviewWord && this.currentReviewWord.soundsWrong;
    const handler = enabled ? () => this.markOK(this.currentReviewWord!.word) : null;
    return new ButtonAction(handler, { tooltip: "Mark word changer as sounding OK" });
  }

  get markSoundsWrongAction(): ButtonAction {
    const enabled = this.currentReviewWord && !this.currentReviewWord.soundsWrong;
    const handler = enabled ? () => this.markSoundsWrong(this.currentReviewWord!.word) : null;
    return new ButtonAction(handler, { tooltip: "Mark word changer as sounding wrong" });
  }

  setReviewState(data: ReviewState): void {
    this.stopAutoplay();

    // Reset all words first
    this.resetAllToUnreviewed();

    // Set reviewed words
    if (data.reviewed) {
      for (const wordStr of data.reviewed) {
        const word = this.wordsMap.get(wordStr);
        if (word) {
          word.reviewed = true;
        }
      }
    }

    // Set words that sound wrong
    if (data.soundsWrong) {
      for (const wordStr of data.soundsWrong) {
        const word = this.wordsMap.get(wordStr);
        if (word) {
          word.soundsWrong = true;
          word.reviewed = true; // Words marked as wrong should also be marked as reviewed
        }
      }
    }
  }

  getReviewState(): ReviewState {
    const reviewed: string[] = [];
    const soundsWrong: string[] = [];

    for (const word of this.sortedWords) {
      if (word.reviewed) {
        reviewed.push(word.word);
      }
      if (word.soundsWrong) {
        soundsWrong.push(word.word);
      }
    }

    return { reviewed, soundsWrong };
  }

  getWrongSoundingWords(): string[] {
    return this.sortedWords
      .filter(word => word.soundsWrong)
      .map(word => word.word)
      .sort();
  }

  resetAllToUnreviewed(): void {
    this.stopAutoplay();
    // Clear current review word
    if (this.currentReviewWord) {
      this.currentReviewWord.currentReview = false;
      this.currentReviewWord = null;
    }

    // Reset all words
    for (const word of this.sortedWords) {
      word.reviewed = false;
      word.currentReview = false;
      word.soundsWrong = false;
    }
  }

  resetAllToOK(): void {
    this.stopAutoplay();
    // Clear current review word
    if (this.currentReviewWord) {
      this.currentReviewWord.currentReview = false;
      this.currentReviewWord = null;
    }

    // Set all words as reviewed and OK
    for (const word of this.sortedWords) {
      word.reviewed = true;
      word.currentReview = false;
      word.soundsWrong = false;
    }
  }

  reviewWrongWords(): void {
    this.stopAutoplay();
    for (const word of this.sortedWords) {
      word.reviewed = !word.soundsWrong;
    }

    // Clear current review word if it's not wrong
    if (this.currentReviewWord && !this.currentReviewWord.soundsWrong) {
      this.currentReviewWord.currentReview = false;
      this.currentReviewWord = null;
    }
  }

  markOK(wordStr: string): void {
    this.stopAutoplay();
    const word = this.wordsMap.get(wordStr);
    if (word) {
      word.soundsWrong = false;
      word.reviewed = true;
    }
  }

  markSoundsWrong(wordStr: string): void {
    this.stopAutoplay();
    const word = this.wordsMap.get(wordStr);
    if (word) {
      word.soundsWrong = true;
      word.reviewed = true;
    }
  }

  async reviewWord(wordStr: string): Promise<void> {
    this.stopAutoplay();
    const word = this.wordsMap.get(wordStr);
    if (!word) return;

    // Mark current review word as reviewed if it exists
    if (this.currentReviewWord) {
      this.currentReviewWord.reviewed = true;
      this.currentReviewWord.currentReview = false;
    }

    // Set new current review word
    this.currentReviewWord = word;
    word.currentReview = true;

    // Say the word
    await this.wordSayer.say(wordStr);
  }

  reset(): void {
    // Stop autoplay if running
    this.stopAutoplay();

    // Reset filter settings
    this.filter.value.set('');
    this.filter.matchOption.set('start');
    this.setReviewStateFilter(ReviewStateFilterOption.ALL);
    this.maxNumWordsToShow = this.defaultMaxNumWordsToShow; // Reset to initial value

    // Clear current review word
    if (this.currentReviewWord) {
      this.currentReviewWord.currentReview = false;
      this.currentReviewWord = null;
    }
  }

  loadReviewStateFromFile(file: File): void {
    this.stopAutoplay();
    if (file.name !== 'review-pronunciation-state.json') {
      alert('Please select a file named "review-pronunciation-state.json"');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const reviewState = getReviewStateFromJson(jsonData);
        this.setReviewState(reviewState);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Error parsing JSON file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }

  private triggerFileUpload(): void {
    this.stopAutoplay();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.loadReviewStateFromFile(file);
      }
    };
    input.click();
  }

  private saveState(): void {
    this.stopAutoplay();
    const state = this.getReviewState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'review-pronunciation-state.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  private downloadWrongWords(): void {
    this.stopAutoplay();
    const wrongWords = this.getWrongSoundingWords();
    const content = wrongWords.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'words-that-sound-wrong.txt';
    a.click();
    URL.revokeObjectURL(url);
  }


  @action
  setReviewStateFilter(filter: ReviewStateFilterOption): void {
    this.stopAutoplay();
    this.reviewStateFilter = filter;
  }

  @action
  setAutoPlayWaitMillis(millis: number): void {
    this.autoPlayWaitMillis = millis;
  }

  @action
  setReviewMode(reviewMode: boolean): void {
    this.stopAutoplay();
    this.reviewMode = reviewMode;
  }

  @action
  showMoreWords(): void {
    this.maxNumWordsToShow = this.maxNumWordsToShow * 2;
  }

  @action
  resetMaxWordsToShow(): void {
    this.maxNumWordsToShow = this.defaultMaxNumWordsToShow;
  }

  get resetMaxWordsAction(): ButtonAction {
    const enabled = this.maxNumWordsToShow !== this.defaultMaxNumWordsToShow;
    const handler = enabled ? () => this.resetMaxWordsToShow() : null;
    const tooltip = `Reset maximum number of words to show to ${this.defaultMaxNumWordsToShow}`;
    return new ButtonAction(handler, { tooltip });
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

    if (this.currentReviewWordIndex === null) {
      // No word changer, start with first word
      await this.reviewWord(filtered[0].word);
    } else if (this.currentReviewWordIndex < filtered.length - 1) {
      // Move to next word
      const nextIndex = this.currentReviewWordIndex + 1;
      await this.reviewWord(filtered[nextIndex].word);
    } else {
      // At end of list, repeat word changer
      if (this.currentReviewWord) {
        await this.wordSayer.say(this.currentReviewWord.word);
      }
    }
  }

  // Navigate to previous word in filtered list
  @action
  async gotoPreviousWord(): Promise<void> {
    const filtered = this.filteredWords;
    if (filtered.length === 0) return;

    if (this.currentReviewWordIndex === null) {
      // No word changer, start with last word
      await this.reviewWord(filtered[filtered.length - 1].word);
    } else if (this.currentReviewWordIndex > 0) {
      // Move to previous word
      const prevIndex = this.currentReviewWordIndex - 1;
      await this.reviewWord(filtered[prevIndex].word);
    } else {
      // At start of list, repeat word changer
      if (this.currentReviewWord) {
        await this.wordSayer.say(this.currentReviewWord.word);
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
    if (this.currentReviewWord) {
      currentIndexInDisplayed = wordsToAutoplay.findIndex(word => word === this.currentReviewWord);
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

    // Mark current review word as reviewed if it exists
    if (this.currentReviewWord) {
      this.currentReviewWord.reviewed = true;
      this.currentReviewWord.currentReview = false;
    }

    // Set new current review word
    this.currentReviewWord = nextWord;
    nextWord.currentReview = true;

    // Say the word and wait for it to finish
    await this.wordSayer.say(nextWord.word);

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
