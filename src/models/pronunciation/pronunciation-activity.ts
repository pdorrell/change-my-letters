import { makeObservable, observable, computed, action, override } from 'mobx';
import { Word } from '@/models/Word';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { ButtonAction } from '@/lib/models/actions';
import { PronunciationBase } from './pronunciation-base';

/**
 * Manages interactions for the Pronunciation Activity page
 */
export class PronunciationActivity extends PronunciationBase {
  // Activity mode word display limit
  defaultMaxNumWordsToShow: number = 20;
  maxNumWordsToShow: number = this.defaultMaxNumWordsToShow;

  constructor(
    sortedWords: Word[],
    wordSayer: WordSayerInterface
  ) {
    super(sortedWords, wordSayer, false); // activity mode

    makeObservable(this, {
      maxNumWordsToShow: observable,
      displayedWords: override,
      hasMoreWords: computed,
      showMoreWordsAction: computed,
      resetMaxWordsAction: computed,
      showMoreWords: action,
      resetMaxWordsToShow: action,
      setFilterValue: override,
      setFilterMatchOption: override
    });
  }

  get displayedWords(): Word[] {
    const filtered = this.filteredWords;
    // In activity mode, limit to maxNumWordsToShow
    return filtered.slice(0, this.maxNumWordsToShow);
  }

  get hasMoreWords(): boolean {
    // True if there are more words beyond the displayed limit
    return this.filteredWords.length > this.maxNumWordsToShow;
  }

  get showMoreWordsAction(): ButtonAction {
    const additionalWords = this.filteredWords.length - this.maxNumWordsToShow;
    const wordsToShow = Math.min(additionalWords, this.maxNumWordsToShow);
    const tooltip = `Show ${wordsToShow} more words`;
    const handler = this.hasMoreWords ? () => this.showMoreWords() : null;
    return new ButtonAction(handler, { tooltip });
  }

  get resetMaxWordsAction(): ButtonAction {
    const enabled = this.maxNumWordsToShow !== this.defaultMaxNumWordsToShow;
    const handler = enabled ? () => this.resetMaxWordsToShow() : null;
    const tooltip = `Reset maximum number of words to show to ${this.defaultMaxNumWordsToShow}`;
    return new ButtonAction(handler, { tooltip });
  }

  @action
  showMoreWords(): void {
    this.maxNumWordsToShow = this.maxNumWordsToShow * 2;
  }

  @action
  resetMaxWordsToShow(): void {
    this.maxNumWordsToShow = this.defaultMaxNumWordsToShow;
  }

  @action
  setFilterValue(value: string): void {
    super.setFilterValue(value);
    this.maxNumWordsToShow = this.defaultMaxNumWordsToShow;
  }

  @action
  setFilterMatchOption(option: 'start' | 'end' | 'any'): void {
    super.setFilterMatchOption(option);
    this.maxNumWordsToShow = this.defaultMaxNumWordsToShow;
  }

  reset(): void {
    super.reset();
    this.maxNumWordsToShow = this.defaultMaxNumWordsToShow;
  }

  // Activity mode implementation of setCurrentWord - simple word change without review state
  protected setCurrentWord(wordStr: string): void {
    const word = this.wordsMap.get(wordStr);
    if (!word) return;

    // Clear previous current word
    if (this.currentWord) {
      this.currentWord.currentReview = false;
    }

    // Set new current word
    this.currentWord = word;
    word.currentReview = true;
  }
}
