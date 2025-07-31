import { makeObservable, observable, computed, action, override } from 'mobx';
import { Word } from '@/models/Word';
import { WordSayerInterface } from '@/models/word-sayer-interface';
import { ReviewStateFilterOption } from '@/models/pronunciation/review-state-filter-option';
import { ButtonAction } from '@/lib/models/actions';
import { ReviewState, getReviewStateFromJson } from '@/models/pronunciation/review-state';
import { PronunciationBase } from './pronunciation-base';

/**
 * Manages interactions for the Pronunciation Review page
 */
export class PronunciationReview extends PronunciationBase {
  reviewStateFilter: ReviewStateFilterOption = ReviewStateFilterOption.ALL;

  // Button actions
  loadStateAction: ButtonAction;
  saveStateAction: ButtonAction;
  downloadWrongWordsAction: ButtonAction;
  resetAllToUnreviewedAction: ButtonAction;
  resetAllToOKAction: ButtonAction;
  reviewWrongWordsAction: ButtonAction;

  constructor(
    sortedWords: Word[],
    wordSayer: WordSayerInterface
  ) {
    super(sortedWords, wordSayer);

    // Initialize button actions
    this.loadStateAction = new ButtonAction(() => this.triggerFileUpload(), { tooltip: "Upload review-pronunciation-state.json" });
    this.saveStateAction = new ButtonAction(() => this.saveState(), { tooltip: "Download review-pronunciation-state.json" });
    this.downloadWrongWordsAction = new ButtonAction(() => this.downloadWrongWords(), { tooltip: "Download words-that-sound-wrong.txt" });
    this.resetAllToUnreviewedAction = new ButtonAction(() => this.resetAllToUnreviewed(), { tooltip: "Reset all words to unreviewed" });
    this.resetAllToOKAction = new ButtonAction(() => this.resetAllToOK(), { tooltip: "Reset all words to OK" });
    this.reviewWrongWordsAction = new ButtonAction(() => this.reviewWrongWords(), { tooltip: "Update review state so that only current 'wrong' words are to be reviewed" });

    makeObservable(this, {
      reviewStateFilter: observable,
      filteredWords: override,
      reviewStateFilterOptions: computed,
      markOKAction: computed,
      markSoundsWrongAction: computed,
      setReviewStateFilter: action
    });
  }

  get reviewStateFilterOptions(): ReviewStateFilterOption[] {
    return ReviewStateFilterOption.options;
  }

  get filteredWords(): Word[] {
    // Apply review state filter first
    const stateFiltered = this.sortedWords.filter(word => this.reviewStateFilter.include(word));

    // Get word strings and apply text filter
    const wordStrings = stateFiltered.map(word => word.word);
    const textFiltered = this.filter.filtered(wordStrings);

    // Return Word objects that match the text filter
    return stateFiltered.filter(word => textFiltered.includes(word.word));
  }

  get markOKAction(): ButtonAction {
    const enabled = this.currentWord && this.currentWord.soundsWrong;
    const handler = enabled ? () => this.markOK(this.currentWord!) : null;
    return new ButtonAction(handler, { tooltip: "Mark word changer as sounding OK" });
  }

  get markSoundsWrongAction(): ButtonAction {
    const enabled = this.currentWord && !this.currentWord.soundsWrong;
    const handler = enabled ? () => this.markSoundsWrong(this.currentWord!) : null;
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
    if (this.currentWord) {
      this.currentWord.currentReview = false;
      this.currentWord = null;
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
    if (this.currentWord) {
      this.currentWord.currentReview = false;
      this.currentWord = null;
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
    if (this.currentWord && !this.currentWord.soundsWrong) {
      this.currentWord.currentReview = false;
      this.currentWord = null;
    }
  }

  markOK(word: Word): void {
    this.stopAutoplay();
    word.soundsWrong = false;
    word.reviewed = true;
  }

  markSoundsWrong(word: Word): void {
    this.stopAutoplay();
    word.soundsWrong = true;
    word.reviewed = true;
  }

  reset(): void {
    super.reset();
    this.setReviewStateFilter(ReviewStateFilterOption.ALL);
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

  setReviewStateFilter(filter: ReviewStateFilterOption): void {
    this.stopAutoplay();
    this.reviewStateFilter = filter;
  }

  // Review mode implementation of setCurrentWord - handles review state changes
  protected setCurrentWord(word: Word): void {
    // Mark current review word as reviewed if it exists
    if (this.currentWord) {
      this.currentWord.reviewed = true;
      this.currentWord.currentReview = false;
    }

    // Set new current review word
    this.currentWord = word;
    word.currentReview = true;
  }
}
