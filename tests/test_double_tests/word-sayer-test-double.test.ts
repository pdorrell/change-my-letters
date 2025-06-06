import { WordSayerTestDouble } from '@/tests/test_doubles/word-sayer-test-double';

describe('WordSayerTestDouble', () => {
  let wordSayer: WordSayerTestDouble;

  beforeEach(() => {
    wordSayer = new WordSayerTestDouble();
  });

  it('should track preloaded words', () => {
    wordSayer.preload('cat');
    wordSayer.preload('dog');
    wordSayer.preload('cat'); // Duplicates should be handled

    expect(wordSayer.preloadedWords.has('cat')).toBe(true);
    expect(wordSayer.preloadedWords.has('dog')).toBe(true);
    expect(wordSayer.preloadedWords.size).toBe(2); // Set should deduplicate
  });

  it('should track played words', () => {
    wordSayer.say('cat');
    wordSayer.say('dog');
    wordSayer.say('cat'); // Should record duplicates

    expect(wordSayer.playedWords).toEqual(['cat', 'dog', 'cat']);
    expect(wordSayer.playedWords.length).toBe(3);
  });
});
