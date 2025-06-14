import { ReviewPronunciationInteraction } from '@/models/review/review-pronunciation-interaction';
import { ReviewStateFilterOption } from '@/models/review/review-state-filter-option';
import { Word } from '@/models/Word';
import { WordSayerTestDouble } from '@/tests/test_doubles/word-sayer-test-double';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to create File objects from review-state test data files
function createFileFromTestData(filename: string, customName?: string): File {
  const testFilePath = path.join(__dirname, '../data/test-files/review-state', filename);
  const content = fs.readFileSync(testFilePath, 'utf8');
  return new File([content], customName || 'review-pronunciation-state.json', { type: 'application/json' });
}

describe('ReviewPronunciationInteraction', () => {
  let reviewInteraction: ReviewPronunciationInteraction;
  let wordSayer: WordSayerTestDouble;
  let testWords: Word[];

  beforeEach(() => {
    wordSayer = new WordSayerTestDouble();

    // Create test words
    testWords = [
      new Word('cat', [false, false, false], ['', '', '', ''], ['', '', '']),
      new Word('dog', [false, false, false], ['', '', '', ''], ['', '', '']),
      new Word('fish', [false, false, false, false], ['', '', '', '', ''], ['', '', '', '']),
      new Word('bird', [false, false, false, false], ['', '', '', '', ''], ['', '', '', ''])
    ];

    reviewInteraction = new ReviewPronunciationInteraction(testWords, wordSayer);
  });

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      expect(reviewInteraction.filter.value.value).toBe('');
      expect(reviewInteraction.reviewStateFilter).toBe(ReviewStateFilterOption.ALL);
      expect(reviewInteraction.filter.matchOption.value).toBe('start');
      expect(reviewInteraction.currentReviewWord).toBeNull();
      expect(reviewInteraction.sortedWords).toEqual(testWords);
    });

    it('should initialize button actions', () => {
      expect(reviewInteraction.loadStateAction).toBeDefined();
      expect(reviewInteraction.saveStateAction).toBeDefined();
      expect(reviewInteraction.downloadWrongWordsAction).toBeDefined();
      expect(reviewInteraction.resetAllToUnreviewedAction).toBeDefined();
      expect(reviewInteraction.resetAllToOKAction).toBeDefined();
      expect(reviewInteraction.reviewWrongWordsAction).toBeDefined();
    });

    it('should have review state filter options', () => {
      const options = reviewInteraction.reviewStateFilterOptions;
      expect(options).toHaveLength(4);
      expect(options[0]).toBe(ReviewStateFilterOption.ALL);
      expect(options[1]).toBe(ReviewStateFilterOption.UNREVIEWED);
      expect(options[2]).toBe(ReviewStateFilterOption.WRONG);
      expect(options[3]).toBe(ReviewStateFilterOption.UNREVIEWED_OR_WRONG);
    });
  });

  describe('filtering', () => {
    it('should filter words by text (match start)', () => {
      reviewInteraction.filter.value.set('c');
      reviewInteraction.filter.matchOption.set('start');

      const filtered = reviewInteraction.filteredWords;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].word).toBe('cat');
    });

    it('should filter words by text (contains)', () => {
      reviewInteraction.filter.value.set('i');
      reviewInteraction.filter.matchOption.set('any');

      const filtered = reviewInteraction.filteredWords;
      expect(filtered).toHaveLength(2);
      expect(filtered.map(w => w.word)).toContain('fish');
      expect(filtered.map(w => w.word)).toContain('bird');
    });

    it('should filter words by review state - unreviewed', () => {
      // Mark some words as reviewed
      testWords[0].reviewed = true;
      testWords[1].reviewed = true;

      reviewInteraction.reviewStateFilter = ReviewStateFilterOption.UNREVIEWED;

      const filtered = reviewInteraction.filteredWords;
      expect(filtered).toHaveLength(2);
      expect(filtered.map(w => w.word)).toContain('fish');
      expect(filtered.map(w => w.word)).toContain('bird');
    });

    it('should filter words by review state - wrong', () => {
      // Mark some words as wrong
      testWords[0].soundsWrong = true;
      testWords[2].soundsWrong = true;

      reviewInteraction.reviewStateFilter = ReviewStateFilterOption.WRONG;

      const filtered = reviewInteraction.filteredWords;
      expect(filtered).toHaveLength(2);
      expect(filtered.map(w => w.word)).toContain('cat');
      expect(filtered.map(w => w.word)).toContain('fish');
    });

    it('should filter words by review state - unreviewed or wrong', () => {
      // Mark some words as reviewed and OK
      testWords[0].reviewed = true;
      testWords[0].soundsWrong = false;

      // Mark one as wrong
      testWords[1].soundsWrong = true;

      // Leave others unreviewed

      reviewInteraction.reviewStateFilter = ReviewStateFilterOption.UNREVIEWED_OR_WRONG;

      const filtered = reviewInteraction.filteredWords;
      expect(filtered).toHaveLength(3); // dog (wrong), fish (unreviewed), bird (unreviewed)
      expect(filtered.map(w => w.word)).toContain('dog');
      expect(filtered.map(w => w.word)).toContain('fish');
      expect(filtered.map(w => w.word)).toContain('bird');
      expect(filtered.map(w => w.word)).not.toContain('cat'); // reviewed and OK
    });

    it('should combine text and review state filters', () => {
      testWords[0].reviewed = true; // cat reviewed
      testWords[2].soundsWrong = true; // fish wrong

      reviewInteraction.filter.value.set('f');
      reviewInteraction.filter.matchOption.set('start');
      reviewInteraction.reviewStateFilter = ReviewStateFilterOption.WRONG;

      const filtered = reviewInteraction.filteredWords;
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

      reviewInteraction.setReviewState(reviewState);

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

      const reviewState = reviewInteraction.getReviewState();

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

      const wrongWords = reviewInteraction.getWrongSoundingWords();

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
      reviewInteraction.currentReviewWord = testWords[1];
    });

    it('should reset all to unreviewed', () => {
      reviewInteraction.resetAllToUnreviewed();

      testWords.forEach(word => {
        expect(word.reviewed).toBe(false);
        expect(word.soundsWrong).toBe(false);
        expect(word.currentReview).toBe(false);
      });
      expect(reviewInteraction.currentReviewWord).toBeNull();
    });

    it('should reset all to OK', () => {
      reviewInteraction.resetAllToOK();

      testWords.forEach(word => {
        expect(word.reviewed).toBe(true);
        expect(word.soundsWrong).toBe(false);
        expect(word.currentReview).toBe(false);
      });
      expect(reviewInteraction.currentReviewWord).toBeNull();
    });

    it('should review wrong words', () => {
      testWords[0].soundsWrong = true;
      testWords[1].soundsWrong = false;
      testWords[2].soundsWrong = true;

      reviewInteraction.reviewWrongWords();

      expect(testWords[0].reviewed).toBe(false); // wrong word
      expect(testWords[1].reviewed).toBe(true); // not wrong
      expect(testWords[2].reviewed).toBe(false); // wrong word
    });

    it('should clear current review word if not wrong when reviewing wrong words', () => {
      testWords[1].soundsWrong = false;
      testWords[1].currentReview = true;
      reviewInteraction.currentReviewWord = testWords[1];

      reviewInteraction.reviewWrongWords();

      expect(testWords[1].currentReview).toBe(false);
      expect(reviewInteraction.currentReviewWord).toBeNull();
    });

    it('should keep current review word if wrong when reviewing wrong words', () => {
      testWords[1].soundsWrong = true;
      testWords[1].currentReview = true;
      reviewInteraction.currentReviewWord = testWords[1];

      reviewInteraction.reviewWrongWords();

      expect(testWords[1].currentReview).toBe(true);
      expect(reviewInteraction.currentReviewWord).toBe(testWords[1]);
    });
  });

  describe('mark functions', () => {
    it('should mark word as OK', () => {
      testWords[0].soundsWrong = true;

      reviewInteraction.markOK('cat');

      expect(testWords[0].soundsWrong).toBe(false);
      expect(testWords[0].reviewed).toBe(true);
    });

    it('should mark word as sounds wrong', () => {
      reviewInteraction.markSoundsWrong('cat');

      expect(testWords[0].soundsWrong).toBe(true);
      expect(testWords[0].reviewed).toBe(true);
    });

    it('should handle non-existent words gracefully', () => {
      expect(() => {
        reviewInteraction.markOK('nonexistent');
        reviewInteraction.markSoundsWrong('nonexistent');
      }).not.toThrow();
    });
  });

  describe('review word function', () => {
    it('should set current review word and say it', () => {
      reviewInteraction.reviewWord('cat');

      expect(reviewInteraction.currentReviewWord).toBe(testWords[0]);
      expect(testWords[0].currentReview).toBe(true);
      expect(wordSayer.playedWords).toContain('cat');
    });

    it('should mark previous review word as reviewed when setting new one', () => {
      // Set initial review word
      reviewInteraction.reviewWord('cat');

      // Set new review word
      reviewInteraction.reviewWord('dog');

      expect(testWords[0].reviewed).toBe(true);
      expect(testWords[0].currentReview).toBe(false);
      expect(testWords[1].currentReview).toBe(true);
      expect(reviewInteraction.currentReviewWord).toBe(testWords[1]);
    });

    it('should handle non-existent words gracefully', () => {
      expect(() => {
        reviewInteraction.reviewWord('nonexistent');
      }).not.toThrow();

      expect(reviewInteraction.currentReviewWord).toBeNull();
    });
  });

  describe('computed button actions', () => {
    it('should enable mark OK action when word changer sounds wrong', () => {
      testWords[0].soundsWrong = true;
      reviewInteraction.currentReviewWord = testWords[0];

      const action = reviewInteraction.markOKAction;
      expect(action.enabled).toBe(true);
    });

    it('should disable mark OK action when word changer does not sound wrong', () => {
      testWords[0].soundsWrong = false;
      reviewInteraction.currentReviewWord = testWords[0];

      const action = reviewInteraction.markOKAction;
      expect(action.enabled).toBe(false);
    });

    it('should disable mark OK action when no word changer', () => {
      reviewInteraction.currentReviewWord = null;

      const action = reviewInteraction.markOKAction;
      expect(action.enabled).toBe(false);
    });

    it('should enable mark sounds wrong action when word changer does not sound wrong', () => {
      testWords[0].soundsWrong = false;
      reviewInteraction.currentReviewWord = testWords[0];

      const action = reviewInteraction.markSoundsWrongAction;
      expect(action.enabled).toBe(true);
    });

    it('should disable mark sounds wrong action when word changer sounds wrong', () => {
      testWords[0].soundsWrong = true;
      reviewInteraction.currentReviewWord = testWords[0];

      const action = reviewInteraction.markSoundsWrongAction;
      expect(action.enabled).toBe(false);
    });
  });

  describe('reset function', () => {
    it('should reset filter settings and clear current review word', () => {
      reviewInteraction.filter.value.set('test');
      reviewInteraction.filter.matchOption.set('any');
      reviewInteraction.reviewStateFilter = ReviewStateFilterOption.WRONG;
      testWords[0].currentReview = true;
      reviewInteraction.currentReviewWord = testWords[0];

      reviewInteraction.reset();

      expect(reviewInteraction.filter.value.value).toBe('');
      expect(reviewInteraction.filter.matchOption.value).toBe('start');
      expect(reviewInteraction.reviewStateFilter).toBe(ReviewStateFilterOption.ALL);
      expect(reviewInteraction.currentReviewWord).toBeNull();
      expect(reviewInteraction.currentReviewWordIndex).toBeNull();
      expect(testWords[0].currentReview).toBe(false);
    });
  });

  describe('keyboard navigation', () => {
    it('should initialize with null currentReviewWordIndex', () => {
      expect(reviewInteraction.currentReviewWordIndex).toBeNull();
    });

    it('should update currentReviewWordIndex when reviewWord is called', () => {
      reviewInteraction.reviewWord('dog'); // dog is at index 1 in testWords

      expect(reviewInteraction.currentReviewWordIndex).toBe(1);
      expect(reviewInteraction.currentReviewWord).toBe(testWords[1]);
    });

    describe('gotoNextWord', () => {
      it('should start with first word when no word changer', () => {
        expect(reviewInteraction.currentReviewWord).toBeNull();

        reviewInteraction.gotoNextWord();

        expect(reviewInteraction.currentReviewWord).toBe(testWords[0]); // 'cat'
        expect(reviewInteraction.currentReviewWordIndex).toBe(0);
        expect(wordSayer.playedWords).toContain('cat');
      });

      it('should move to next word in sequence', () => {
        reviewInteraction.reviewWord('cat'); // Start at index 0
        wordSayer.playedWords = []; // Clear previous calls

        reviewInteraction.gotoNextWord();

        expect(reviewInteraction.currentReviewWord).toBe(testWords[1]); // 'dog'
        expect(reviewInteraction.currentReviewWordIndex).toBe(1);
        expect(wordSayer.playedWords).toContain('dog');
      });

      it('should repeat word changer when at end of list', () => {
        reviewInteraction.reviewWord('bird'); // Last word (index 3)
        wordSayer.playedWords = []; // Clear previous calls

        reviewInteraction.gotoNextWord();

        expect(reviewInteraction.currentReviewWord).toBe(testWords[3]); // Still 'bird'
        expect(reviewInteraction.currentReviewWordIndex).toBe(3);
        expect(wordSayer.playedWords).toContain('bird');
      });

      it('should handle empty filtered list gracefully', () => {
        reviewInteraction.filter.value.set('nonexistent');

        reviewInteraction.gotoNextWord();

        expect(reviewInteraction.currentReviewWord).toBeNull();
        expect(reviewInteraction.currentReviewWordIndex).toBeNull();
      });
    });

    describe('gotoPreviousWord', () => {
      it('should start with last word when no word changer', () => {
        expect(reviewInteraction.currentReviewWord).toBeNull();

        reviewInteraction.gotoPreviousWord();

        expect(reviewInteraction.currentReviewWord).toBe(testWords[3]); // 'bird'
        expect(reviewInteraction.currentReviewWordIndex).toBe(3);
        expect(wordSayer.playedWords).toContain('bird');
      });

      it('should move to previous word in sequence', () => {
        reviewInteraction.reviewWord('dog'); // Start at index 1
        wordSayer.playedWords = []; // Clear previous calls

        reviewInteraction.gotoPreviousWord();

        expect(reviewInteraction.currentReviewWord).toBe(testWords[0]); // 'cat'
        expect(reviewInteraction.currentReviewWordIndex).toBe(0);
        expect(wordSayer.playedWords).toContain('cat');
      });

      it('should repeat word changer when at start of list', () => {
        reviewInteraction.reviewWord('cat'); // First word (index 0)
        wordSayer.playedWords = []; // Clear previous calls

        reviewInteraction.gotoPreviousWord();

        expect(reviewInteraction.currentReviewWord).toBe(testWords[0]); // Still 'cat'
        expect(reviewInteraction.currentReviewWordIndex).toBe(0);
        expect(wordSayer.playedWords).toContain('cat');
      });

      it('should handle empty filtered list gracefully', () => {
        reviewInteraction.filter.value.set('nonexistent');

        reviewInteraction.gotoPreviousWord();

        expect(reviewInteraction.currentReviewWord).toBeNull();
        expect(reviewInteraction.currentReviewWordIndex).toBeNull();
      });
    });

    describe('navigation with filtering', () => {
      it('should update index when filter changes', () => {
        // Start with 'dog' selected (index 1 in full list)
        reviewInteraction.reviewWord('dog');
        expect(reviewInteraction.currentReviewWordIndex).toBe(1);

        // Filter to only words starting with 'd'
        reviewInteraction.filter.value.set('d');

        // Now 'dog' should be at index 0 in filtered list
        expect(reviewInteraction.currentReviewWordIndex).toBe(0);

        // Test navigation works with filter
        reviewInteraction.gotoNextWord();
        expect(reviewInteraction.currentReviewWord?.word).toBe('dog'); // Should repeat since it's the only 'd' word
      });

      it('should handle word disappearing from filter', () => {
        // Start with 'cat' selected
        reviewInteraction.reviewWord('cat');
        expect(reviewInteraction.currentReviewWordIndex).toBe(0);

        // Filter to only words starting with 'd' (cat disappears)
        reviewInteraction.filter.value.set('d');

        // Index should be null since 'cat' is not in filtered list
        expect(reviewInteraction.currentReviewWordIndex).toBeNull();
        expect(reviewInteraction.currentReviewWord?.word).toBe('cat'); // Word is still current

        // Navigation should work from filtered list
        reviewInteraction.gotoNextWord();
        expect(reviewInteraction.currentReviewWord?.word).toBe('dog');
      });
    });
  });

  describe('loadReviewStateFromFile', () => {
    it('should load valid review state from test file', (done) => {
      // Use real test file with valid data
      const file = createFileFromTestData('valid-review-state.json');

      // Spy on setReviewState to verify it gets called with correct data
      const setReviewStateSpy = jest.spyOn(reviewInteraction, 'setReviewState');

      reviewInteraction.loadReviewStateFromFile(file);

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

      reviewInteraction.loadReviewStateFromFile(file);

      expect(alertSpy).toHaveBeenCalledWith('Please select a file named "review-pronunciation-state.json"');

      alertSpy.mockRestore();
    });

    it('should show alert for invalid JSON content', (done) => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Use real test file with invalid JSON
      const file = createFileFromTestData('invalid-json.json');

      reviewInteraction.loadReviewStateFromFile(file);

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

      reviewInteraction.loadReviewStateFromFile(file);

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
});
