import { PronunciationReview } from '@/models/pronunciation/pronunciation-review';
import { ReviewStateFilterOption } from '@/models/pronunciation/review-state-filter-option';
import { Word } from '@/models/Word';
import { AudioFilePlayerTestDouble } from '@/tests/test_doubles/audio-file-player-test-double';
import { WordSayer } from '@/models/word-sayer';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to create File objects from review-state test data files
function createFileFromTestData(filename: string, customName?: string): File {
  const testFilePath = path.join(__dirname, '../data/test-files/review-state', filename);
  const content = fs.readFileSync(testFilePath, 'utf8');
  return new File([content], customName || 'review-pronunciation-state.json', { type: 'application/json' });
}

describe('Pronunciation', () => {
  let pronunciation: PronunciationReview;
  let wordSayer: WordSayer;
  let audioFilePlayer: AudioFilePlayerTestDouble;
  let testWords: Word[];

  beforeEach(() => {
    audioFilePlayer = new AudioFilePlayerTestDouble('/assets/words/amazon_polly');
    wordSayer = new WordSayer(audioFilePlayer, 'words');

    // Create test words
    testWords = [
      new Word('cat', [false, false, false], ['', '', '', ''], ['', '', '']),
      new Word('dog', [false, false, false], ['', '', '', ''], ['', '', '']),
      new Word('fish', [false, false, false, false], ['', '', '', '', ''], ['', '', '', '']),
      new Word('bird', [false, false, false, false], ['', '', '', '', ''], ['', '', '', ''])
    ];

    pronunciation = new PronunciationReview(testWords, wordSayer);
  });

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      expect(pronunciation.filter.value.value).toBe('');
      expect(pronunciation.reviewStateFilter).toBe(ReviewStateFilterOption.ALL);
      expect(pronunciation.filter.matchOption.value).toBe('start');
      expect(pronunciation.currentWord).toBeNull();
      expect(pronunciation.sortedWords).toEqual(testWords);
    });

    it('should initialize button actions', () => {
      expect(pronunciation.loadStateAction).toBeDefined();
      expect(pronunciation.saveStateAction).toBeDefined();
      expect(pronunciation.downloadWrongWordsAction).toBeDefined();
      expect(pronunciation.resetAllToUnreviewedAction).toBeDefined();
      expect(pronunciation.resetAllToOKAction).toBeDefined();
      expect(pronunciation.reviewWrongWordsAction).toBeDefined();
    });

    it('should have review state filter options', () => {
      const options = pronunciation.reviewStateFilterOptions;
      expect(options).toHaveLength(4);
      expect(options[0]).toBe(ReviewStateFilterOption.ALL);
      expect(options[1]).toBe(ReviewStateFilterOption.UNREVIEWED);
      expect(options[2]).toBe(ReviewStateFilterOption.WRONG);
      expect(options[3]).toBe(ReviewStateFilterOption.UNREVIEWED_OR_WRONG);
    });
  });

  describe('filtering', () => {
    it('should filter words by text (match start)', () => {
      pronunciation.filter.value.set('c');
      pronunciation.filter.matchOption.set('start');

      const filtered = pronunciation.filteredWords;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].word).toBe('cat');
    });

    it('should filter words by text (contains)', () => {
      pronunciation.filter.value.set('i');
      pronunciation.filter.matchOption.set('any');

      const filtered = pronunciation.filteredWords;
      expect(filtered).toHaveLength(2);
      expect(filtered.map(w => w.word)).toContain('fish');
      expect(filtered.map(w => w.word)).toContain('bird');
    });

    it('should filter words by review state - unreviewed', () => {
      // In review mode by default
      // Mark some words as reviewed
      testWords[0].reviewed = true;
      testWords[1].reviewed = true;

      pronunciation.reviewStateFilter = ReviewStateFilterOption.UNREVIEWED;

      const filtered = pronunciation.filteredWords;
      expect(filtered).toHaveLength(2);
      expect(filtered.map(w => w.word)).toContain('fish');
      expect(filtered.map(w => w.word)).toContain('bird');
    });

    it('should filter words by review state - wrong', () => {
      // In review mode by default
      // Mark some words as wrong
      testWords[0].soundsWrong = true;
      testWords[2].soundsWrong = true;

      pronunciation.reviewStateFilter = ReviewStateFilterOption.WRONG;

      const filtered = pronunciation.filteredWords;
      expect(filtered).toHaveLength(2);
      expect(filtered.map(w => w.word)).toContain('cat');
      expect(filtered.map(w => w.word)).toContain('fish');
    });

    it('should filter words by review state - unreviewed or wrong', () => {
      // In review mode by default
      // Mark some words as reviewed and OK
      testWords[0].reviewed = true;
      testWords[0].soundsWrong = false;

      // Mark one as wrong
      testWords[1].soundsWrong = true;

      // Leave others unreviewed

      pronunciation.reviewStateFilter = ReviewStateFilterOption.UNREVIEWED_OR_WRONG;

      const filtered = pronunciation.filteredWords;
      expect(filtered).toHaveLength(3); // dog (wrong), fish (unreviewed), bird (unreviewed)
      expect(filtered.map(w => w.word)).toContain('dog');
      expect(filtered.map(w => w.word)).toContain('fish');
      expect(filtered.map(w => w.word)).toContain('bird');
      expect(filtered.map(w => w.word)).not.toContain('cat'); // reviewed and OK
    });

    it('should combine text and review state filters', () => {
      // In review mode by default
      testWords[0].reviewed = true; // cat reviewed
      testWords[2].soundsWrong = true; // fish wrong

      pronunciation.filter.value.set('f');
      pronunciation.filter.matchOption.set('start');
      pronunciation.reviewStateFilter = ReviewStateFilterOption.WRONG;

      const filtered = pronunciation.filteredWords;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].word).toBe('fish');
    });
  });

  describe('review state management', () => {
    it('should set review state from JSON data', () => {
      const reviewState = {
        reviewed: ['cat', 'dog'],
        soundsWrong: ['dog']
      };

      pronunciation.setReviewState(reviewState);

      expect(testWords[0].reviewed).toBe(true); // cat
      expect(testWords[0].soundsWrong).toBe(false);
      expect(testWords[1].reviewed).toBe(true); // dog
      expect(testWords[1].soundsWrong).toBe(true);
      expect(testWords[2].reviewed).toBe(false); // fish
      expect(testWords[2].soundsWrong).toBe(false);
    });

    it('should get review state as JSON data', () => {
      testWords[0].reviewed = true;
      testWords[1].reviewed = true;
      testWords[1].soundsWrong = true;
      testWords[2].soundsWrong = true;
      testWords[2].reviewed = true;

      const reviewState = pronunciation.getReviewState();

      expect(reviewState.reviewed).toContain('cat');
      expect(reviewState.reviewed).toContain('dog');
      expect(reviewState.reviewed).toContain('fish');
      expect(reviewState.soundsWrong).toContain('dog');
      expect(reviewState.soundsWrong).toContain('fish');
      expect(reviewState.soundsWrong).not.toContain('cat');
    });

    it('should get wrong sounding words sorted', () => {
      testWords[3].soundsWrong = true; // bird
      testWords[1].soundsWrong = true; // dog
      testWords[0].soundsWrong = true; // cat

      const wrongWords = pronunciation.getWrongSoundingWords();

      expect(wrongWords).toEqual(['bird', 'cat', 'dog']); // sorted alphabetically
    });
  });

  describe('reset functions', () => {
    beforeEach(() => {
      // Set up some initial state
      testWords[0].reviewed = true;
      testWords[0].soundsWrong = true;
      testWords[1].reviewed = true;
      testWords[1].currentReview = true;
      pronunciation.currentWord = testWords[1];
    });

    it('should reset all to unreviewed', () => {
      pronunciation.resetAllToUnreviewed();

      testWords.forEach(word => {
        expect(word.reviewed).toBe(false);
        expect(word.soundsWrong).toBe(false);
        expect(word.currentReview).toBe(false);
      });
      expect(pronunciation.currentWord).toBeNull();
    });

    it('should reset all to OK', () => {
      pronunciation.resetAllToOK();

      testWords.forEach(word => {
        expect(word.reviewed).toBe(true);
        expect(word.soundsWrong).toBe(false);
        expect(word.currentReview).toBe(false);
      });
      expect(pronunciation.currentWord).toBeNull();
    });

    it('should review wrong words', () => {
      testWords[0].soundsWrong = true;
      testWords[1].soundsWrong = false;
      testWords[2].soundsWrong = true;

      pronunciation.reviewWrongWords();

      expect(testWords[0].reviewed).toBe(false); // wrong word
      expect(testWords[1].reviewed).toBe(true); // not wrong
      expect(testWords[2].reviewed).toBe(false); // wrong word
    });

    it('should clear current review word if not wrong when reviewing wrong words', () => {
      testWords[1].soundsWrong = false;
      testWords[1].currentReview = true;
      pronunciation.currentWord = testWords[1];

      pronunciation.reviewWrongWords();

      expect(testWords[1].currentReview).toBe(false);
      expect(pronunciation.currentWord).toBeNull();
    });

    it('should keep current review word if wrong when reviewing wrong words', () => {
      testWords[1].soundsWrong = true;
      testWords[1].currentReview = true;
      pronunciation.currentWord = testWords[1];

      pronunciation.reviewWrongWords();

      expect(testWords[1].currentReview).toBe(true);
      expect(pronunciation.currentWord).toBe(testWords[1]);
    });
  });

  describe('mark functions', () => {
    it('should mark word as OK', () => {
      testWords[0].soundsWrong = true;

      pronunciation.markOK(testWords[0]);

      expect(testWords[0].soundsWrong).toBe(false);
      expect(testWords[0].reviewed).toBe(true);
    });

    it('should mark word as sounds wrong', () => {
      pronunciation.markSoundsWrong(testWords[0]);

      expect(testWords[0].soundsWrong).toBe(true);
      expect(testWords[0].reviewed).toBe(true);
    });

    it('should handle non-existent words gracefully', () => {
      expect(() => {
        const nonexistentWord = new Word('nonexistent', [], [], []);
        pronunciation.markOK(nonexistentWord);
        pronunciation.markSoundsWrong(nonexistentWord);
      }).not.toThrow();
    });
  });

  describe('review word function', () => {
    it('should set current review word and say it', () => {
      pronunciation.reviewWord(testWords[0]);

      expect(pronunciation.currentWord).toBe(testWords[0]);
      expect(testWords[0].currentReview).toBe(true);
      expect(audioFilePlayer.playedFiles).toContain('words/cat');
    });

    it('should mark previous review word as reviewed when setting new one', () => {
      // Set initial review word
      pronunciation.reviewWord(testWords[0]);

      // Set new review word
      pronunciation.reviewWord(testWords[1]);

      expect(testWords[0].reviewed).toBe(true);
      expect(testWords[0].currentReview).toBe(false);
      expect(testWords[1].currentReview).toBe(true);
      expect(pronunciation.currentWord).toBe(testWords[1]);
    });

    it('should handle non-existent words gracefully', () => {
      expect(() => {
        const nonexistentWord = new Word('nonexistent', [], [], []);
        pronunciation.reviewWord(nonexistentWord);
      }).not.toThrow();

      // Since we're now passing Word objects directly, the nonexistent word becomes the current word
      expect(pronunciation.currentWord?.word).toBe('nonexistent');
    });
  });

  describe('computed button actions', () => {
    it('should enable mark OK action when word changer sounds wrong', () => {
      testWords[0].soundsWrong = true;
      pronunciation.currentWord = testWords[0];

      const action = pronunciation.markOKAction;
      expect(action.enabled).toBe(true);
    });

    it('should disable mark OK action when word changer does not sound wrong', () => {
      testWords[0].soundsWrong = false;
      pronunciation.currentWord = testWords[0];

      const action = pronunciation.markOKAction;
      expect(action.enabled).toBe(false);
    });

    it('should disable mark OK action when no word changer', () => {
      pronunciation.currentWord = null;

      const action = pronunciation.markOKAction;
      expect(action.enabled).toBe(false);
    });

    it('should enable mark sounds wrong action when word changer does not sound wrong', () => {
      testWords[0].soundsWrong = false;
      pronunciation.currentWord = testWords[0];

      const action = pronunciation.markSoundsWrongAction;
      expect(action.enabled).toBe(true);
    });

    it('should disable mark sounds wrong action when word changer sounds wrong', () => {
      testWords[0].soundsWrong = true;
      pronunciation.currentWord = testWords[0];

      const action = pronunciation.markSoundsWrongAction;
      expect(action.enabled).toBe(false);
    });
  });

  describe('reset function', () => {
    it('should reset filter settings and clear current review word', () => {
      pronunciation.filter.value.set('test');
      pronunciation.filter.matchOption.set('any');
      pronunciation.reviewStateFilter = ReviewStateFilterOption.WRONG;
      testWords[0].currentReview = true;
      pronunciation.currentWord = testWords[0];

      pronunciation.reset();

      expect(pronunciation.filter.value.value).toBe('');
      expect(pronunciation.filter.matchOption.value).toBe('start');
      expect(pronunciation.reviewStateFilter).toBe(ReviewStateFilterOption.ALL);
      expect(pronunciation.currentWord).toBeNull();
      expect(pronunciation.currentWordIndex).toBeNull();
      expect(testWords[0].currentReview).toBe(false);
    });
  });

  describe('keyboard navigation', () => {
    it('should initialize with null currentWordIndex', () => {
      expect(pronunciation.currentWordIndex).toBeNull();
    });

    it('should update currentWordIndex when reviewWord is called', () => {
      pronunciation.reviewWord(testWords[1]); // dog is at index 1 in testWords

      expect(pronunciation.currentWordIndex).toBe(1);
      expect(pronunciation.currentWord).toBe(testWords[1]);
    });

    describe('gotoNextWord', () => {
      it('should start with first word when no word changer', () => {
        expect(pronunciation.currentWord).toBeNull();

        pronunciation.gotoNextWord();

        expect(pronunciation.currentWord).toBe(testWords[0]); // 'cat'
        expect(pronunciation.currentWordIndex).toBe(0);
        expect(audioFilePlayer.playedFiles).toContain('words/cat');
      });

      it('should move to next word in sequence', () => {
        pronunciation.reviewWord(testWords[0]); // Start at index 0
        audioFilePlayer.playedFiles = []; // Clear previous calls

        pronunciation.gotoNextWord();

        expect(pronunciation.currentWord).toBe(testWords[1]); // 'dog'
        expect(pronunciation.currentWordIndex).toBe(1);
        expect(audioFilePlayer.playedFiles).toContain('words/dog');
      });

      it('should repeat word changer when at end of list', () => {
        pronunciation.reviewWord(testWords[3]); // Last word (index 3)
        audioFilePlayer.playedFiles = []; // Clear previous calls

        pronunciation.gotoNextWord();

        expect(pronunciation.currentWord).toBe(testWords[3]); // Still 'bird'
        expect(pronunciation.currentWordIndex).toBe(3);
        expect(audioFilePlayer.playedFiles).toContain('words/bird');
      });

      it('should handle empty filtered list gracefully', () => {
        pronunciation.filter.value.set('nonexistent');

        pronunciation.gotoNextWord();

        expect(pronunciation.currentWord).toBeNull();
        expect(pronunciation.currentWordIndex).toBeNull();
      });
    });

    describe('gotoPreviousWord', () => {
      it('should start with last word when no word changer', () => {
        expect(pronunciation.currentWord).toBeNull();

        pronunciation.gotoPreviousWord();

        expect(pronunciation.currentWord).toBe(testWords[3]); // 'bird'
        expect(pronunciation.currentWordIndex).toBe(3);
        expect(audioFilePlayer.playedFiles).toContain('words/bird');
      });

      it('should move to previous word in sequence', () => {
        pronunciation.reviewWord(testWords[1]); // Start at index 1
        audioFilePlayer.playedFiles = []; // Clear previous calls

        pronunciation.gotoPreviousWord();

        expect(pronunciation.currentWord).toBe(testWords[0]); // 'cat'
        expect(pronunciation.currentWordIndex).toBe(0);
        expect(audioFilePlayer.playedFiles).toContain('words/cat');
      });

      it('should repeat word changer when at start of list', () => {
        pronunciation.reviewWord(testWords[0]); // First word (index 0)
        audioFilePlayer.playedFiles = []; // Clear previous calls

        pronunciation.gotoPreviousWord();

        expect(pronunciation.currentWord).toBe(testWords[0]); // Still 'cat'
        expect(pronunciation.currentWordIndex).toBe(0);
        expect(audioFilePlayer.playedFiles).toContain('words/cat');
      });

      it('should handle empty filtered list gracefully', () => {
        pronunciation.filter.value.set('nonexistent');

        pronunciation.gotoPreviousWord();

        expect(pronunciation.currentWord).toBeNull();
        expect(pronunciation.currentWordIndex).toBeNull();
      });
    });

    describe('navigation with filtering', () => {
      it('should update index when filter changes', () => {
        // Start with 'dog' selected (index 1 in full list)
        pronunciation.reviewWord(testWords[1]);
        expect(pronunciation.currentWordIndex).toBe(1);

        // Filter to only words starting with 'd'
        pronunciation.filter.value.set('d');

        // Now 'dog' should be at index 0 in filtered list
        expect(pronunciation.currentWordIndex).toBe(0);

        // Test navigation works with filter
        pronunciation.gotoNextWord();
        expect(pronunciation.currentWord?.word).toBe('dog'); // Should repeat since it's the only 'd' word
      });

      it('should handle word disappearing from filter', () => {
        // Start with 'cat' selected
        pronunciation.reviewWord(testWords[0]);
        expect(pronunciation.currentWordIndex).toBe(0);

        // Filter to only words starting with 'd' (cat disappears)
        pronunciation.filter.value.set('d');

        // Index should be null since 'cat' is not in filtered list
        expect(pronunciation.currentWordIndex).toBeNull();
        expect(pronunciation.currentWord?.word).toBe('cat'); // Word is still current

        // Navigation should work from filtered list
        pronunciation.gotoNextWord();
        expect(pronunciation.currentWord?.word).toBe('dog');
      });
    });
  });

  describe('loadReviewStateFromFile', () => {
    it('should load valid review state from test file', (done) => {
      // Use real test file with valid data
      const file = createFileFromTestData('valid-review-state.json');

      // Spy on setReviewState to verify it gets called with correct data
      const setReviewStateSpy = jest.spyOn(pronunciation, 'setReviewState');

      pronunciation.loadReviewStateFromFile(file);

      // Wait for FileReader to complete (real FileReader is asynchronous)
      setTimeout(() => {
        expect(setReviewStateSpy).toHaveBeenCalledWith({
          reviewed: ['cat', 'dog', 'fish'],
          soundsWrong: ['dog', 'fish']
        });

        done();
      }, 50); // Give real FileReader time to complete
    });

    it('should show alert for incorrect filename', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      // Use real test file but with wrong filename
      const file = createFileFromTestData('valid-review-state.json', 'wrong-name.json');

      pronunciation.loadReviewStateFromFile(file);

      expect(alertSpy).toHaveBeenCalledWith('Please select a file named "review-pronunciation-state.json"');

      alertSpy.mockRestore();
    });

    it('should show alert for invalid JSON content', (done) => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Use real test file with invalid JSON
      const file = createFileFromTestData('invalid-json.json');

      pronunciation.loadReviewStateFromFile(file);

      // Wait for FileReader to complete and error handling to execute
      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith('Error parsing JSON file. Please check the file format.');

        alertSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        done();
      }, 50);
    });

    it('should show alert for invalid review state structure', (done) => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Use real test file with invalid structure
      const file = createFileFromTestData('invalid-structure.json');

      pronunciation.loadReviewStateFromFile(file);

      // Wait for FileReader to complete and validation to execute
      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith('Error parsing JSON file. Please check the file format.');

        alertSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        done();
      }, 50);
    });
  });

  // TODO: Add separate tests for PronunciationActivity functionality:
  // - maxNumWordsToShow functionality
  // - hasMoreWords
  // - showMoreWords functionality
  // - Activity mode specific behavior
});
