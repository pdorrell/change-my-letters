import { makeAutoObservable, computed, action } from 'mobx';
import { Word } from './Word';
import { WordSayerInterface } from './WordSayerInterface';
import { ReviewStateFilterOption } from './ReviewStateFilterOption';
import { ButtonAction } from '../lib/ui/actions';

interface ReviewState {
  reviewed: string[];
  soundsWrong: string[];
}

/**
 * Manages interactions for the Review Pronunciation page
 */
export class ReviewPronunciationInteraction {
  // Filter settings
  filter: string = '';
  reviewStateFilter: ReviewStateFilterOption = ReviewStateFilterOption.ALL;
  matchStartOnly: boolean = true;
  
  // Current review word
  currentReviewWord: Word | null = null;
  
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
    this.reviewWrongWordsAction = new ButtonAction(() => this.reviewWrongWords(), { tooltip: "Set reviewed = not soundsWrong for all words" });
    
    makeAutoObservable(this, {
      filteredWords: computed,
      reviewStateFilterOptions: computed,
      currentReviewWordIndex: computed,
      markOKAction: computed,
      markSoundsWrongAction: computed
    });
  }

  get reviewStateFilterOptions(): ReviewStateFilterOption[] {
    return ReviewStateFilterOption.options;
  }

  get filteredWords(): Word[] {
    return this.sortedWords.filter(word => {
      // Apply text filter
      const matchesText = this.matchStartOnly
        ? word.word.toLowerCase().startsWith(this.filter.toLowerCase())
        : word.word.toLowerCase().includes(this.filter.toLowerCase());
      
      if (!matchesText) return false;
      
      // Apply review state filter
      return this.reviewStateFilter.include(word);
    });
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
    return new ButtonAction(handler, { tooltip: "Mark current word as sounding OK" });
  }

  get markSoundsWrongAction(): ButtonAction {
    const enabled = this.currentReviewWord && !this.currentReviewWord.soundsWrong;
    const handler = enabled ? () => this.markSoundsWrong(this.currentReviewWord!.word) : null;
    return new ButtonAction(handler, { tooltip: "Mark current word as sounding wrong" });
  }

  setReviewState(jsonData: any): void {
    const data = jsonData as ReviewState;
    
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
    const word = this.wordsMap.get(wordStr);
    if (word) {
      word.soundsWrong = false;
      word.reviewed = true;
    }
  }

  markSoundsWrong(wordStr: string): void {
    const word = this.wordsMap.get(wordStr);
    if (word) {
      word.soundsWrong = true;
      word.reviewed = true;
    }
  }

  reviewWord(wordStr: string): void {
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
    this.wordSayer.say(wordStr);
  }

  reset(): void {
    // Reset filter settings
    this.filter = '';
    this.matchStartOnly = true;
    this.reviewStateFilter = ReviewStateFilterOption.ALL;
    
    // Clear current review word
    if (this.currentReviewWord) {
      this.currentReviewWord.currentReview = false;
      this.currentReviewWord = null;
    }
  }

  private triggerFileUpload(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && file.name === 'review-pronunciation-state.json') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target?.result as string);
            this.setReviewState(jsonData);
          } catch (error) {
            console.error('Error parsing JSON file:', error);
            alert('Error parsing JSON file. Please check the file format.');
          }
        };
        reader.readAsText(file);
      } else {
        alert('Please select a file named "review-pronunciation-state.json"');
      }
    };
    input.click();
  }

  private saveState(): void {
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

  // Action methods for form controls
  @action
  setFilter(value: string): void {
    this.filter = value;
  }

  @action
  setMatchStartOnly(value: boolean): void {
    this.matchStartOnly = value;
  }

  @action
  setReviewStateFilter(filter: ReviewStateFilterOption): void {
    this.reviewStateFilter = filter;
  }


  // Navigate to next word in filtered list
  @action
  gotoNextWord(): void {
    const filtered = this.filteredWords;
    if (filtered.length === 0) return;
    
    if (this.currentReviewWordIndex === null) {
      // No current word, start with first word
      this.reviewWord(filtered[0].word);
    } else if (this.currentReviewWordIndex < filtered.length - 1) {
      // Move to next word
      const nextIndex = this.currentReviewWordIndex + 1;
      this.reviewWord(filtered[nextIndex].word);
    } else {
      // At end of list, repeat current word
      if (this.currentReviewWord) {
        this.wordSayer.say(this.currentReviewWord.word);
      }
    }
  }

  // Navigate to previous word in filtered list
  @action
  gotoPreviousWord(): void {
    const filtered = this.filteredWords;
    if (filtered.length === 0) return;
    
    if (this.currentReviewWordIndex === null) {
      // No current word, start with last word
      this.reviewWord(filtered[filtered.length - 1].word);
    } else if (this.currentReviewWordIndex > 0) {
      // Move to previous word
      const prevIndex = this.currentReviewWordIndex - 1;
      this.reviewWord(filtered[prevIndex].word);
    } else {
      // At start of list, repeat current word
      if (this.currentReviewWord) {
        this.wordSayer.say(this.currentReviewWord.word);
      }
    }
  }
}