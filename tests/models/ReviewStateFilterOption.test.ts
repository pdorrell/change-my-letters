import { ReviewStateFilterOption } from '../../src/models/ReviewStateFilterOption';
import { Word } from '../../src/models/Word';

describe('ReviewStateFilterOption', () => {
  let reviewedOKWord: Word;
  let reviewedWrongWord: Word;
  let unreviewedWord: Word;

  beforeEach(() => {
    // Create test words with different review states
    reviewedOKWord = new Word('cat', [false], ['', ''], ['']);
    reviewedOKWord.reviewed = true;
    reviewedOKWord.soundsWrong = false;

    reviewedWrongWord = new Word('dog', [false], ['', ''], ['']);
    reviewedWrongWord.reviewed = true;
    reviewedWrongWord.soundsWrong = true;

    unreviewedWord = new Word('fish', [false], ['', ''], ['']);
    unreviewedWord.reviewed = false;
    unreviewedWord.soundsWrong = false;
  });

  describe('ALL filter', () => {
    it('should include all words regardless of review state', () => {
      expect(ReviewStateFilterOption.ALL.include(reviewedOKWord)).toBe(true);
      expect(ReviewStateFilterOption.ALL.include(reviewedWrongWord)).toBe(true);
      expect(ReviewStateFilterOption.ALL.include(unreviewedWord)).toBe(true);
    });

    it('should have correct label', () => {
      expect(ReviewStateFilterOption.ALL.label).toBe('All');
    });
  });

  describe('UNREVIEWED filter', () => {
    it('should include only unreviewed words', () => {
      expect(ReviewStateFilterOption.UNREVIEWED.include(reviewedOKWord)).toBe(false);
      expect(ReviewStateFilterOption.UNREVIEWED.include(reviewedWrongWord)).toBe(false);
      expect(ReviewStateFilterOption.UNREVIEWED.include(unreviewedWord)).toBe(true);
    });

    it('should have correct label', () => {
      expect(ReviewStateFilterOption.UNREVIEWED.label).toBe('Un-reviewed');
    });
  });

  describe('WRONG filter', () => {
    it('should include only words that sound wrong', () => {
      expect(ReviewStateFilterOption.WRONG.include(reviewedOKWord)).toBe(false);
      expect(ReviewStateFilterOption.WRONG.include(reviewedWrongWord)).toBe(true);
      expect(ReviewStateFilterOption.WRONG.include(unreviewedWord)).toBe(false);
    });

    it('should have correct label', () => {
      expect(ReviewStateFilterOption.WRONG.label).toBe('Wrong');
    });
  });

  describe('UNREVIEWED_OR_WRONG filter', () => {
    it('should include unreviewed words and words that sound wrong', () => {
      expect(ReviewStateFilterOption.UNREVIEWED_OR_WRONG.include(reviewedOKWord)).toBe(false);
      expect(ReviewStateFilterOption.UNREVIEWED_OR_WRONG.include(reviewedWrongWord)).toBe(true);
      expect(ReviewStateFilterOption.UNREVIEWED_OR_WRONG.include(unreviewedWord)).toBe(true);
    });

    it('should have correct label', () => {
      expect(ReviewStateFilterOption.UNREVIEWED_OR_WRONG.label).toBe('Un-reviewed or Wrong');
    });
  });

  describe('options static property', () => {
    it('should contain all filter options in correct order', () => {
      const options = ReviewStateFilterOption.options;
      
      expect(options).toHaveLength(4);
      expect(options[0]).toBe(ReviewStateFilterOption.ALL);
      expect(options[1]).toBe(ReviewStateFilterOption.UNREVIEWED);
      expect(options[2]).toBe(ReviewStateFilterOption.WRONG);
      expect(options[3]).toBe(ReviewStateFilterOption.UNREVIEWED_OR_WRONG);
    });
  });

  describe('edge cases', () => {
    it('should handle word with soundsWrong=true but reviewed=false for UNREVIEWED_OR_WRONG', () => {
      const edgeWord = new Word('edge', [false], ['', ''], ['']);
      edgeWord.reviewed = false;
      edgeWord.soundsWrong = true;

      expect(ReviewStateFilterOption.UNREVIEWED_OR_WRONG.include(edgeWord)).toBe(true);
      expect(ReviewStateFilterOption.UNREVIEWED.include(edgeWord)).toBe(true);
      expect(ReviewStateFilterOption.WRONG.include(edgeWord)).toBe(true);
    });

    it('should handle word with reviewed=true and soundsWrong=false for all filters', () => {
      const reviewedOKWord = new Word('ok', [false], ['', ''], ['']);
      reviewedOKWord.reviewed = true;
      reviewedOKWord.soundsWrong = false;

      expect(ReviewStateFilterOption.ALL.include(reviewedOKWord)).toBe(true);
      expect(ReviewStateFilterOption.UNREVIEWED.include(reviewedOKWord)).toBe(false);
      expect(ReviewStateFilterOption.WRONG.include(reviewedOKWord)).toBe(false);
      expect(ReviewStateFilterOption.UNREVIEWED_OR_WRONG.include(reviewedOKWord)).toBe(false);
    });
  });
});