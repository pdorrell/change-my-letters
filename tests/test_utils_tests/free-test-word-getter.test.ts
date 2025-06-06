import { Word } from '@/models/Word';
import { FreeTestWordGetter } from '@/tests/utils/free-test-word-getter';

describe('FreeTestWordGetter', () => {
  describe('constructor', () => {
    it('should create empty getter when no initial words provided', () => {
      const getter = new FreeTestWordGetter();
      expect(getter.getWordCount()).toBe(0);
      expect(getter.getAllWords()).toEqual([]);
    });

    it('should create getter with initial words', () => {
      const word1 = new Word('cat', [true, true, true], ['', '', '', ''], ['', '', '']);
      const word2 = new Word('bat', [true, true, true], ['', '', '', ''], ['', '', '']);
      const getter = new FreeTestWordGetter([word1, word2]);

      expect(getter.getWordCount()).toBe(2);
      expect(getter.hasWord('cat')).toBe(true);
      expect(getter.hasWord('bat')).toBe(true);
      expect(getter.hasWord('hat')).toBe(false);
    });
  });

  describe('addWord', () => {
    it('should add a word to the getter', () => {
      const getter = new FreeTestWordGetter();
      const word = new Word('test', [true, true, true, true], ['', '', '', '', ''], ['', '', '', '']);

      getter.addWord(word);

      expect(getter.getWordCount()).toBe(1);
      expect(getter.hasWord('test')).toBe(true);
      expect(getter.getRequiredWord('test')).toBe(word);
    });

    it('should replace existing word with same string', () => {
      const getter = new FreeTestWordGetter();
      const word1 = new Word('test', [true, true, true, true], ['', '', '', '', ''], ['', '', '', '']);
      const word2 = new Word('test', [true, true, true, true], ['', '', '', '', ''], ['', '', '', '']);

      getter.addWord(word1);
      getter.addWord(word2);

      expect(getter.getWordCount()).toBe(1);
      expect(getter.getRequiredWord('test')).toBe(word2);
    });
  });

  describe('getRequiredWord', () => {
    it('should return existing word when it exists', () => {
      const word = new Word('existing', [true, true, true, true, true, true, true, true], ['', '', '', '', '', '', '', '', ''], ['', '', '', '', '', '', '', '']);
      const getter = new FreeTestWordGetter([word]);

      const result = getter.getRequiredWord('existing');

      expect(result).toBe(word);
      expect(getter.getWordCount()).toBe(1);
    });

    it('should create new word when it does not exist', () => {
      const getter = new FreeTestWordGetter();

      const result = getter.getRequiredWord('newword');

      expect(result).toBeInstanceOf(Word);
      expect(result.word).toBe('newword');
      expect(getter.getWordCount()).toBe(1);
      expect(getter.hasWord('newword')).toBe(true);
    });

    it('should return same instance when called multiple times for same word', () => {
      const getter = new FreeTestWordGetter();

      const result1 = getter.getRequiredWord('same');
      const result2 = getter.getRequiredWord('same');

      expect(result1).toBe(result2);
      expect(getter.getWordCount()).toBe(1);
    });
  });

  describe('helper methods', () => {
    it('should return all words via getAllWords', () => {
      const word1 = new Word('first', [true, true, true, true, true], ['', '', '', '', '', ''], ['', '', '', '', '']);
      const word2 = new Word('second', [true, true, true, true, true, true], ['', '', '', '', '', '', ''], ['', '', '', '', '', '']);
      const getter = new FreeTestWordGetter([word1]);
      getter.addWord(word2);

      const allWords = getter.getAllWords();

      expect(allWords).toHaveLength(2);
      expect(allWords).toContain(word1);
      expect(allWords).toContain(word2);
    });

    it('should report correct word count', () => {
      const getter = new FreeTestWordGetter();

      expect(getter.getWordCount()).toBe(0);

      getter.getRequiredWord('one');
      expect(getter.getWordCount()).toBe(1);

      getter.getRequiredWord('two');
      expect(getter.getWordCount()).toBe(2);

      getter.getRequiredWord('one'); // Same word again
      expect(getter.getWordCount()).toBe(2);
    });

    it('should correctly check if word exists', () => {
      const getter = new FreeTestWordGetter();

      expect(getter.hasWord('missing')).toBe(false);

      getter.getRequiredWord('present');
      expect(getter.hasWord('present')).toBe(true);
      expect(getter.hasWord('missing')).toBe(false);
    });
  });

  describe('integration with Word.populateChanges', () => {
    it('should work as WordGetter for Word.populateChanges', () => {
      const getter = new FreeTestWordGetter();
      const word = getter.getRequiredWord('cat'); // Let FreeTestWordGetter create the Word

      // This should not throw and should populate changes
      word.populateChanges(getter);

      // Verify that new words were created during population
      expect(getter.getWordCount()).toBeGreaterThan(1); // Should have more than just 'cat'

      // Check that some expected words were created (based on default delete/insert/replace permissions)
      expect(getter.hasWord('at')).toBe(true); // deletion of 'c'
      expect(getter.hasWord('ca')).toBe(true); // deletion of 't'
    });
  });
});
