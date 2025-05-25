import { AppState } from '../../src/models/AppState';
import { ReviewPronunciationInteraction } from '../../src/models/ReviewPronunciationInteraction';
import { ReviewStateFilterOption } from '../../src/models/ReviewStateFilterOption';
import { createTestAppState } from '../utils/TestAppBuilder';

describe('Review Pronunciation Integration', () => {
  let appState: AppState;
  let reviewInteraction: ReviewPronunciationInteraction;

  beforeEach(() => {
    appState = createTestAppState();
    reviewInteraction = appState.reviewPronunciationInteraction;
  });

  describe('AppState integration', () => {
    it('should initialize review pronunciation interaction in AppState', () => {
      expect(appState.reviewPronunciationInteraction).toBeDefined();
      expect(appState.reviewPronunciationInteraction).toBeInstanceOf(ReviewPronunciationInteraction);
    });

    it('should navigate to review pronunciation view', () => {
      appState.navigateTo('reviewPronunciationView');
      
      expect(appState.currentPage).toBe('reviewPronunciationView');
    });

    it('should reset review interaction when navigating to review pronunciation view', () => {
      // Set some state
      reviewInteraction.filter = 'test';
      reviewInteraction.matchStartOnly = false;
      
      appState.navigateTo('reviewPronunciationView');
      
      expect(reviewInteraction.filter).toBe('');
      expect(reviewInteraction.matchStartOnly).toBe(true);
    });

    it('should have review pronunciation action button', () => {
      expect(appState.reviewPronunciationAction).toBeDefined();
      expect(appState.reviewPronunciationAction.enabled).toBe(true);
    });

    it('should navigate to review pronunciation when action is triggered', () => {
      appState.reviewPronunciationAction.doAction();
      
      expect(appState.currentPage).toBe('reviewPronunciationView');
    });
  });

  describe('Word Graph integration', () => {
    it('should use sorted words from word graph', () => {
      const sortedWords = appState.wordGraph.sortedWords;
      
      expect(reviewInteraction.sortedWords).toBe(sortedWords);
      expect(reviewInteraction.sortedWords.length).toBeGreaterThan(0);
    });

    it('should be able to review all words from the graph', () => {
      const allWords = appState.wordGraph.sortedWords;
      
      // Should be able to mark any word from the graph
      allWords.forEach(word => {
        expect(() => {
          reviewInteraction.markOK(word.word);
          reviewInteraction.markSoundsWrong(word.word);
          reviewInteraction.reviewWord(word.word);
        }).not.toThrow();
      });
    });
  });

  describe('WordSayer integration', () => {
    it('should use the same word sayer as AppState', () => {
      expect(reviewInteraction.wordSayer).toBe(appState.wordSayer);
    });

    it('should say words when reviewing them', () => {
      const wordToReview = appState.wordGraph.sortedWords[0].word;
      
      reviewInteraction.reviewWord(wordToReview);
      
      // Verify the word sayer was called (checking through test double)
      expect((appState.wordSayer as any).playedWords).toContain(wordToReview);
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
      reviewInteraction.reviewWord(testWord.word);
      expect(testWord.currentReview).toBe(true);
      expect(reviewInteraction.currentReviewWord).toBe(testWord);
      
      // Mark as wrong
      reviewInteraction.markSoundsWrong(testWord.word);
      expect(testWord.soundsWrong).toBe(true);
      expect(testWord.reviewed).toBe(true);
      
      // Change to OK
      reviewInteraction.markOK(testWord.word);
      expect(testWord.soundsWrong).toBe(false);
      expect(testWord.reviewed).toBe(true);
    });

    it('should handle reviewing multiple words in sequence', () => {
      const words = appState.wordGraph.sortedWords.slice(0, 3);
      
      // Review first word
      reviewInteraction.reviewWord(words[0].word);
      expect(words[0].currentReview).toBe(true);
      
      // Review second word - should mark first as reviewed
      reviewInteraction.reviewWord(words[1].word);
      expect(words[0].reviewed).toBe(true);
      expect(words[0].currentReview).toBe(false);
      expect(words[1].currentReview).toBe(true);
      
      // Review third word
      reviewInteraction.reviewWord(words[2].word);
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
        reviewInteraction.filter = 'c';
        reviewInteraction.matchStartOnly = true;
        
        const filtered = reviewInteraction.filteredWords;
        expect(filtered.length).toBe(wordsStartingWithC.length);
        filtered.forEach(word => {
          expect(word.word.startsWith('c')).toBe(true);
        });
      }
    });

    it('should filter by review state correctly', () => {
      const words = appState.wordGraph.sortedWords.slice(0, 5);
      
      // Mark some words as reviewed
      words[0].reviewed = true;
      words[1].reviewed = true;
      words[2].soundsWrong = true;
      
      reviewInteraction.reviewStateFilter = ReviewStateFilterOption.UNREVIEWED;
      const unreviewed = reviewInteraction.filteredWords;
      
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
      const exportedState = reviewInteraction.getReviewState();
      
      // Reset all words
      reviewInteraction.resetAllToUnreviewed();
      
      // Verify reset
      words.forEach(word => {
        expect(word.reviewed).toBe(false);
        expect(word.soundsWrong).toBe(false);
      });
      
      // Import state
      reviewInteraction.setReviewState(exportedState);
      
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
      
      const wrongWords = reviewInteraction.getWrongSoundingWords();
      
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
      expect(reviewInteraction.markOKAction.enabled).toBe(false);
      expect(reviewInteraction.markSoundsWrongAction.enabled).toBe(false);
      
      // Set current review word
      const word = appState.wordGraph.sortedWords[0];
      reviewInteraction.reviewWord(word.word);
      
      // Should enable mark as wrong (since not wrong yet)
      expect(reviewInteraction.markSoundsWrongAction.enabled).toBe(true);
      expect(reviewInteraction.markOKAction.enabled).toBe(false);
      
      // Mark as wrong
      word.soundsWrong = true;
      
      // Should enable mark as OK
      expect(reviewInteraction.markOKAction.enabled).toBe(true);
      expect(reviewInteraction.markSoundsWrongAction.enabled).toBe(false);
    });

    it('should execute button actions correctly', () => {
      const word = appState.wordGraph.sortedWords[0];
      reviewInteraction.reviewWord(word.word);
      
      // Execute mark as wrong action
      const markWrongAction = reviewInteraction.markSoundsWrongAction;
      markWrongAction.doAction();
      
      expect(word.soundsWrong).toBe(true);
      expect(word.reviewed).toBe(true);
      
      // Execute mark as OK action
      const markOKAction = reviewInteraction.markOKAction;
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
      
      reviewInteraction.reviewWrongWords();
      
      // reviewed should be set to !soundsWrong
      expect(words[0].reviewed).toBe(true); // not wrong -> reviewed
      expect(words[1].reviewed).toBe(false); // wrong -> not reviewed
      expect(words[2].reviewed).toBe(true); // not wrong -> reviewed
      expect(words[3].reviewed).toBe(false); // wrong -> not reviewed
    });
  });
});