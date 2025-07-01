import { AppState } from '@/models/app-state';
import { Pronunciation } from '@/models/pronunciation/pronunciation';
import { ReviewStateFilterOption } from '@/models/pronunciation/review-state-filter-option';
import { AudioFilePlayerTestDouble } from '@/tests/test_doubles/audio-file-player-test-double';
import { createTestAppState } from '@/tests/utils/test-app-builder';

describe('Pronunciation Integration', () => {
  let appState: AppState;
  let pronunciation: Pronunciation;
  let audioFilePlayerTestDouble: AudioFilePlayerTestDouble;

  beforeEach(() => {
    audioFilePlayerTestDouble = new AudioFilePlayerTestDouble('/assets/words/amazon_polly');
    appState = createTestAppState(audioFilePlayerTestDouble);
    pronunciation = appState.reviewPronunciation;
  });

  describe('AppState integration', () => {
    it('should initialize pronunciation interactions in AppState', () => {
      expect(appState.activityPronunciation).toBeDefined();
      expect(appState.activityPronunciation).toBeInstanceOf(Pronunciation);
      expect(appState.reviewPronunciation).toBeDefined();
      expect(appState.reviewPronunciation).toBeInstanceOf(Pronunciation);
    });

    it('should navigate to review pronunciation view', () => {
      appState.navigateTo('reviewPronunciation');

      expect(appState.currentPage).toBe('reviewPronunciation');
    });

    it('should reset both pronunciation interactions when navigating to review pronunciation view', () => {
      // Set some state on both instances
      appState.activityPronunciation.filter.value.set('test');
      appState.activityPronunciation.filter.matchOption.set('any');
      appState.reviewPronunciation.filter.value.set('other');
      appState.reviewPronunciation.filter.matchOption.set('end');

      appState.navigateTo('reviewPronunciation');

      expect(appState.activityPronunciation.filter.value.value).toBe('');
      expect(appState.activityPronunciation.filter.matchOption.value).toBe('start');
      expect(appState.reviewPronunciation.filter.value.value).toBe('');
      expect(appState.reviewPronunciation.filter.matchOption.value).toBe('start');
    });

  });

  describe('Word Graph integration', () => {
    it('should use sorted words from word graph', () => {
      const sortedWords = appState.wordGraph.sortedWords;

      expect(pronunciation.sortedWords).toBe(sortedWords);
      expect(pronunciation.sortedWords.length).toBeGreaterThan(0);
    });

    it('should be able to review all words from the graph', () => {
      const allWords = appState.wordGraph.sortedWords;

      // Should be able to mark any word from the graph
      allWords.forEach(word => {
        expect(() => {
          pronunciation.markOK(word.word);
          pronunciation.markSoundsWrong(word.word);
          pronunciation.reviewWord(word.word);
        }).not.toThrow();
      });
    });
  });

  describe('WordSayer integration', () => {
    it('should use the same word sayer as AppState', () => {
      expect(pronunciation.wordSayer).toBe(appState.wordSayer);
    });

    it('should say words when reviewing them', () => {
      const wordToReview = appState.wordGraph.sortedWords[0].word;

      pronunciation.reviewWord(wordToReview);

      // Verify the word sayer was called (checking through test double)
      expect(audioFilePlayerTestDouble.playedFiles).toContain(`words/${wordToReview}`);
    });
  });

  describe('Review state workflow', () => {
    it('should handle complete review workflow', () => {
      const testWord = appState.wordGraph.sortedWords[0];

      // Initial state
      expect(testWord.reviewed).toBe(false);
      expect(testWord.soundsWrong).toBe(false);
      expect(testWord.currentReview).toBe(false);

      // Start reviewing
      pronunciation.reviewWord(testWord.word);
      expect(testWord.currentReview).toBe(true);
      expect(pronunciation.currentWord).toBe(testWord);

      // Mark as wrong
      pronunciation.markSoundsWrong(testWord.word);
      expect(testWord.soundsWrong).toBe(true);
      expect(testWord.reviewed).toBe(true);

      // Change to OK
      pronunciation.markOK(testWord.word);
      expect(testWord.soundsWrong).toBe(false);
      expect(testWord.reviewed).toBe(true);
    });

    it('should handle reviewing multiple words in sequence', () => {
      const words = appState.wordGraph.sortedWords.slice(0, 3);

      // Review first word
      pronunciation.reviewWord(words[0].word);
      expect(words[0].currentReview).toBe(true);

      // Review second word - should mark first as reviewed
      pronunciation.reviewWord(words[1].word);
      expect(words[0].reviewed).toBe(true);
      expect(words[0].currentReview).toBe(false);
      expect(words[1].currentReview).toBe(true);

      // Review third word
      pronunciation.reviewWord(words[2].word);
      expect(words[1].reviewed).toBe(true);
      expect(words[1].currentReview).toBe(false);
      expect(words[2].currentReview).toBe(true);
    });
  });

  describe('Filtering integration', () => {
    it('should filter words from the word graph correctly', () => {
      // Get a word that starts with a specific letter
      const wordsStartingWithC = appState.wordGraph.sortedWords.filter(w => w.word.startsWith('c'));

      if (wordsStartingWithC.length > 0) {
        pronunciation.filter.value.set('c');
        pronunciation.filter.matchOption.set('start');

        const filtered = pronunciation.filteredWords;
        expect(filtered.length).toBe(wordsStartingWithC.length);
        filtered.forEach(word => {
          expect(word.word.startsWith('c')).toBe(true);
        });
      }
    });

    it('should filter by review state correctly', () => {
      // Set to review mode for filtering to work
      pronunciation.setReviewMode(true);
      const words = appState.wordGraph.sortedWords.slice(0, 5);

      // Mark some words as reviewed
      words[0].reviewed = true;
      words[1].reviewed = true;
      words[2].soundsWrong = true;

      pronunciation.reviewStateFilter = ReviewStateFilterOption.UNREVIEWED;
      const unreviewed = pronunciation.filteredWords;

      expect(unreviewed).not.toContain(words[0]);
      expect(unreviewed).not.toContain(words[1]);
      expect(unreviewed).toContain(words[3]);
      expect(unreviewed).toContain(words[4]);
    });
  });

  describe('State persistence', () => {
    it('should export and import review state correctly', () => {
      const words = appState.wordGraph.sortedWords.slice(0, 3);

      // Set up some review state
      words[0].reviewed = true;
      words[1].reviewed = true;
      words[1].soundsWrong = true;
      words[2].soundsWrong = true;
      words[2].reviewed = true;

      // Export state
      const exportedState = pronunciation.getReviewState();

      // Reset all words
      pronunciation.resetAllToUnreviewed();

      // Verify reset
      words.forEach(word => {
        expect(word.reviewed).toBe(false);
        expect(word.soundsWrong).toBe(false);
      });

      // Import state
      pronunciation.setReviewState(exportedState);

      // Verify restoration
      expect(words[0].reviewed).toBe(true);
      expect(words[0].soundsWrong).toBe(false);
      expect(words[1].reviewed).toBe(true);
      expect(words[1].soundsWrong).toBe(true);
      expect(words[2].reviewed).toBe(true);
      expect(words[2].soundsWrong).toBe(true);
    });

    it('should get wrong sounding words list correctly', () => {
      const words = appState.wordGraph.sortedWords.slice(0, 4);

      // Mark some words as wrong (in non-alphabetical order)
      words[3].soundsWrong = true; // later in alphabet
      words[0].soundsWrong = true; // earlier in alphabet
      words[2].soundsWrong = true; // middle

      const wrongWords = pronunciation.getWrongSoundingWords();

      expect(wrongWords).toHaveLength(3);
      expect(wrongWords).toContain(words[0].word);
      expect(wrongWords).toContain(words[2].word);
      expect(wrongWords).toContain(words[3].word);

      // Should be sorted alphabetically
      const sortedExpected = [words[0].word, words[2].word, words[3].word].sort();
      expect(wrongWords).toEqual(sortedExpected);
    });
  });

  describe('Button action integration', () => {
    it('should have enabled/disabled button actions based on state', () => {
      // Initially no current review word
      expect(pronunciation.markOKAction.enabled).toBe(false);
      expect(pronunciation.markSoundsWrongAction.enabled).toBe(false);

      // Set current review word
      const word = appState.wordGraph.sortedWords[0];
      pronunciation.reviewWord(word.word);

      // Should enable mark as wrong (since not wrong yet)
      expect(pronunciation.markSoundsWrongAction.enabled).toBe(true);
      expect(pronunciation.markOKAction.enabled).toBe(false);

      // Mark as wrong
      word.soundsWrong = true;

      // Should enable mark as OK
      expect(pronunciation.markOKAction.enabled).toBe(true);
      expect(pronunciation.markSoundsWrongAction.enabled).toBe(false);
    });

    it('should execute button actions correctly', () => {
      const word = appState.wordGraph.sortedWords[0];
      pronunciation.reviewWord(word.word);

      // Execute mark as wrong action
      const markWrongAction = pronunciation.markSoundsWrongAction;
      markWrongAction.doAction();

      expect(word.soundsWrong).toBe(true);
      expect(word.reviewed).toBe(true);

      // Execute mark as OK action
      const markOKAction = pronunciation.markOKAction;
      markOKAction.doAction();

      expect(word.soundsWrong).toBe(false);
      expect(word.reviewed).toBe(true);
    });
  });

  describe('Review wrong words functionality', () => {
    it('should implement review wrong words correctly', () => {
      const words = appState.wordGraph.sortedWords.slice(0, 4);

      // Set up mixed state
      words[0].reviewed = true; // OK word
      words[0].soundsWrong = false;

      words[1].soundsWrong = true; // Wrong word
      words[1].reviewed = true;

      words[2].reviewed = false; // Unreviewed word
      words[2].soundsWrong = false;

      words[3].soundsWrong = true; // Wrong unreviewed word
      words[3].reviewed = false;

      pronunciation.reviewWrongWords();

      // reviewed should be set to !soundsWrong
      expect(words[0].reviewed).toBe(true); // not wrong -> reviewed
      expect(words[1].reviewed).toBe(false); // wrong -> not reviewed
      expect(words[2].reviewed).toBe(true); // not wrong -> reviewed
      expect(words[3].reviewed).toBe(false); // wrong -> not reviewed
    });
  });
});
